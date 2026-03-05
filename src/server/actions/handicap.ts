'use server';

import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import { playerProfiles, handicapHistory, rounds } from '@/lib/drizzle/schema';
import { calculateHandicapIndex } from '@/lib/handicap';
import { eq, desc, gte, and } from 'drizzle-orm';
import type { ActionResponse } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HandicapHistoryEntry = typeof handicapHistory.$inferSelect;

export type HandicapTrendData = {
  labels: string[];
  values: number[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getPlayerIdForSession(userId: string): Promise<string | null> {
  const result = await db
    .select({ id: playerProfiles.id })
    .from(playerProfiles)
    .where(eq(playerProfiles.userId, userId))
    .limit(1);

  return result[0]?.id ?? null;
}

// ---------------------------------------------------------------------------
// recalculateHandicap — compute a new HCP index from last 20 completed rounds
// ---------------------------------------------------------------------------

export async function recalculateHandicap(
  playerId: string,
): Promise<ActionResponse<{ handicapIndex: number; history: HandicapHistoryEntry }>> {
  try {
    // Get the last 20 completed rounds with a score differential
    const completedRounds = await db
      .select({
        id: rounds.id,
        scoreDifferential: rounds.scoreDifferential,
      })
      .from(rounds)
      .where(and(eq(rounds.playerId, playerId), eq(rounds.status, 'completed')))
      .orderBy(desc(rounds.completedAt))
      .limit(20);

    // Filter out rounds without a differential
    const validRounds = completedRounds.filter(
      (r): r is { id: string; scoreDifferential: string } =>
        r.scoreDifferential !== null && r.scoreDifferential !== undefined,
    );

    const differentials = validRounds.map((r) => parseFloat(r.scoreDifferential));

    const handicapIndex = calculateHandicapIndex(differentials);

    if (handicapIndex === null) {
      return {
        success: false,
        error: 'Not enough completed rounds to calculate handicap (minimum 3 required)',
      };
    }

    const latestRoundId = validRounds[0]?.id ?? null;

    // Update playerProfiles.handicapIndex
    await db
      .update(playerProfiles)
      .set({
        handicapIndex: String(handicapIndex),
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.id, playerId));

    // Insert a record in handicapHistory
    const [historyEntry] = await db
      .insert(handicapHistory)
      .values({
        playerId,
        handicapIndex: String(handicapIndex),
        calculatedAt: new Date(),
        roundId: latestRoundId,
        differentials,
      })
      .returning();

    if (!historyEntry) {
      return { success: false, error: 'Failed to insert handicap history record' };
    }

    return { success: true, data: { handicapIndex, history: historyEntry } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getHandicapHistory — newest-first history for the current player
// ---------------------------------------------------------------------------

export async function getHandicapHistory(
  limit = 20,
): Promise<ActionResponse<HandicapHistoryEntry[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const rows = await db
      .select()
      .from(handicapHistory)
      .where(eq(handicapHistory.playerId, playerId))
      .orderBy(desc(handicapHistory.calculatedAt))
      .limit(limit);

    return { success: true, data: rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getHandicapTrend — HCP values over time, formatted for Chart.js line chart
// ---------------------------------------------------------------------------

export async function getHandicapTrend(months = 12): Promise<ActionResponse<HandicapTrendData>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const rows = await db
      .select({
        handicapIndex: handicapHistory.handicapIndex,
        calculatedAt: handicapHistory.calculatedAt,
      })
      .from(handicapHistory)
      .where(and(eq(handicapHistory.playerId, playerId), gte(handicapHistory.calculatedAt, since)))
      .orderBy(handicapHistory.calculatedAt);

    const labels = rows.map((r) =>
      r.calculatedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    );
    const values = rows.map((r) => parseFloat(r.handicapIndex));

    return { success: true, data: { labels, values } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
