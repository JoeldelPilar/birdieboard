'use server';

import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import {
  playerProfiles,
  rounds,
  holeScores,
  courses,
  courseTees,
  matches,
  matchParticipants,
} from '@/lib/drizzle/schema';
import { eq, and, desc, count, inArray } from 'drizzle-orm';
import {
  startRoundSchema,
  saveHoleScoreSchema,
  completeRoundSchema,
} from '@/lib/validations/round';
import { calculateScoreDifferential, calculateStablefordPoints } from '@/lib/handicap';
import { recalculateHandicap } from '@/server/actions/handicap';
import type { StartRoundInput, SaveHoleScoreInput } from '@/lib/validations/round';
import type { ActionResponse } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RoundWithScores = typeof rounds.$inferSelect & {
  holeScores: (typeof holeScores.$inferSelect)[];
  course: { name: string; clubName: string | null };
  tee: {
    teeName: string;
    color: string | null;
    courseRating: string | null;
    slopeRating: number | null;
    par: number | null;
  };
};

export type RoundSummary = {
  id: string;
  roundDate: string;
  status: string;
  grossScore: number | null;
  scoreDifferential: string | null;
  courseName: string;
  teeColor: string | null;
  par: number | null;
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

async function getRoundOwnedByPlayer(
  roundId: string,
  playerId: string,
): Promise<typeof rounds.$inferSelect | null> {
  const result = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.id, roundId), eq(rounds.playerId, playerId)))
    .limit(1);

  return result[0] ?? null;
}

// ---------------------------------------------------------------------------
// startRound — create a new round in_progress
// ---------------------------------------------------------------------------

export async function startRound(
  data: StartRoundInput,
): Promise<ActionResponse<typeof rounds.$inferSelect>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = startRoundSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Verify course exists
    const courseResult = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, parsed.data.courseId))
      .limit(1);

    if (!courseResult[0]) {
      return { success: false, error: 'Course not found' };
    }

    // Verify tee belongs to the course
    const teeResult = await db
      .select({ id: courseTees.id })
      .from(courseTees)
      .where(
        and(eq(courseTees.id, parsed.data.teeId), eq(courseTees.courseId, parsed.data.courseId)),
      )
      .limit(1);

    if (!teeResult[0]) {
      return { success: false, error: 'Tee not found for this course' };
    }

    const [round] = await db
      .insert(rounds)
      .values({
        playerId,
        courseId: parsed.data.courseId,
        teeId: parsed.data.teeId,
        roundDate: parsed.data.roundDate,
        status: 'in_progress',
        startedAt: new Date(),
      })
      .returning();

    if (!round) {
      return { success: false, error: 'Failed to start round' };
    }

    return { success: true, data: round };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// saveHoleScore — upsert a hole score for an in_progress round
// ---------------------------------------------------------------------------

export async function saveHoleScore(
  roundId: string,
  data: SaveHoleScoreInput,
): Promise<ActionResponse<typeof holeScores.$inferSelect>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = saveHoleScoreSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const round = await getRoundOwnedByPlayer(roundId, playerId);
    if (!round) {
      return { success: false, error: 'Round not found' };
    }

    if (round.status !== 'in_progress') {
      return { success: false, error: 'Round is not in progress' };
    }

    // Upsert: insert or update if the hole was already scored
    const [score] = await db
      .insert(holeScores)
      .values({
        roundId,
        holeNumber: parsed.data.holeNumber,
        strokes: parsed.data.strokes,
        putts: parsed.data.putts ?? null,
        fairwayHit: parsed.data.fairwayHit ?? null,
        greenInReg: parsed.data.greenInReg ?? null,
        penaltyStrokes: parsed.data.penaltyStrokes ?? 0,
        clubUsedOffTee: parsed.data.clubUsedOffTee ?? null,
      })
      .onConflictDoUpdate({
        target: [holeScores.roundId, holeScores.holeNumber],
        set: {
          strokes: parsed.data.strokes,
          putts: parsed.data.putts ?? null,
          fairwayHit: parsed.data.fairwayHit ?? null,
          greenInReg: parsed.data.greenInReg ?? null,
          penaltyStrokes: parsed.data.penaltyStrokes ?? 0,
          clubUsedOffTee: parsed.data.clubUsedOffTee ?? null,
        },
      })
      .returning();

    if (!score) {
      return { success: false, error: 'Failed to save hole score' };
    }

    return { success: true, data: score };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// completeRound — finalise a round and compute stats
// ---------------------------------------------------------------------------

export async function completeRound(
  roundId: string,
): Promise<ActionResponse<typeof rounds.$inferSelect>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  // Validate that the schema passes (no extra fields required)
  const parsed = completeRoundSchema.safeParse({});
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const round = await getRoundOwnedByPlayer(roundId, playerId);
    if (!round) {
      return { success: false, error: 'Round not found' };
    }

    if (round.status !== 'in_progress') {
      return { success: false, error: 'Round is not in progress' };
    }

    // Load tee to get course rating, slope and par
    const teeResult = await db
      .select()
      .from(courseTees)
      .where(eq(courseTees.id, round.teeId))
      .limit(1);

    const tee = teeResult[0];
    if (!tee) {
      return { success: false, error: 'Tee data not found' };
    }

    // Load all hole scores for this round
    const scores = await db.select().from(holeScores).where(eq(holeScores.roundId, roundId));

    const expectedHoles = 18; // courses are 18 holes by default

    // Verify all holes are scored — check distinct hole numbers
    const scoredHoles = new Set(scores.map((s) => s.holeNumber));
    for (let hole = 1; hole <= expectedHoles; hole++) {
      if (!scoredHoles.has(hole)) {
        return { success: false, error: `Missing score for hole ${hole}` };
      }
    }

    // Calculate gross score
    const grossScore = scores.reduce((sum, s) => sum + s.strokes, 0);

    // Calculate score differential (WHS)
    const courseRating = parseFloat(tee.courseRating);
    const slopeRating = tee.slopeRating;
    const par = tee.par;

    let scoreDifferential: string | null = null;
    if (!isNaN(courseRating) && slopeRating && par) {
      const differential = calculateScoreDifferential({
        adjustedGrossScore: grossScore,
        courseRating,
        slopeRating,
        par,
      });
      scoreDifferential = String(differential);
    }

    // Calculate total stableford points
    // We use net strokes = strokes - 0 handicap strokes (simple gross stableford, no handicap applied here)
    const stablefordPoints = scores.reduce((total, score) => {
      // For simple gross stableford without per-hole handicap, strokesReceived = 0
      return total + calculateStablefordPoints(score.strokes, 0, 0);
    }, 0);

    // Update round to completed
    const [updated] = await db
      .update(rounds)
      .set({
        status: 'completed',
        grossScore,
        scoreDifferential: scoreDifferential ?? undefined,
        stablefordPoints,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(rounds.id, roundId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Failed to complete round' };
    }

    // Trigger handicap recalculation — best-effort, does not fail the round completion
    await recalculateHandicap(playerId).catch(() => {
      // Insufficient rounds for HCP calculation is expected — swallow the error silently
    });

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getRound — get a round with all hole scores
// ---------------------------------------------------------------------------

export async function getRound(roundId: string): Promise<ActionResponse<RoundWithScores>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Fetch round — must be owned by player
    const roundResult = await db
      .select()
      .from(rounds)
      .where(and(eq(rounds.id, roundId), eq(rounds.playerId, playerId)))
      .limit(1);

    const round = roundResult[0];
    if (!round) {
      return { success: false, error: 'Round not found' };
    }

    // Fetch hole scores
    const scores = await db.select().from(holeScores).where(eq(holeScores.roundId, roundId));

    // Fetch course name
    const courseResult = await db
      .select({ name: courses.name, clubName: courses.clubName })
      .from(courses)
      .where(eq(courses.id, round.courseId))
      .limit(1);

    const course = courseResult[0] ?? { name: '', clubName: null };

    // Fetch tee details
    const teeResult = await db
      .select({
        teeName: courseTees.teeName,
        color: courseTees.color,
        courseRating: courseTees.courseRating,
        slopeRating: courseTees.slopeRating,
        par: courseTees.par,
      })
      .from(courseTees)
      .where(eq(courseTees.id, round.teeId))
      .limit(1);

    const tee = teeResult[0] ?? {
      teeName: '',
      color: null,
      courseRating: null,
      slopeRating: null,
      par: null,
    };

    const roundWithScores: RoundWithScores = {
      ...round,
      holeScores: scores,
      course,
      tee,
    };

    return { success: true, data: roundWithScores };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getMyRounds — paginated list of rounds for the current player
// ---------------------------------------------------------------------------

export async function getMyRounds(
  limit = 20,
  offset = 0,
): Promise<ActionResponse<{ rounds: RoundSummary[]; total: number }>> {
  // Clamp pagination params to safe bounds
  limit = Math.max(1, Math.min(100, limit));
  offset = Math.max(0, offset);

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Get total count
    const countResult = await db
      .select({ total: count() })
      .from(rounds)
      .where(eq(rounds.playerId, playerId));

    const total = countResult[0]?.total ?? 0;

    // Get paginated rounds with course and tee info via joins
    const rows = await db
      .select({
        id: rounds.id,
        roundDate: rounds.roundDate,
        status: rounds.status,
        grossScore: rounds.grossScore,
        scoreDifferential: rounds.scoreDifferential,
        courseName: courses.name,
        teeColor: courseTees.color,
        par: courseTees.par,
      })
      .from(rounds)
      .innerJoin(courses, eq(rounds.courseId, courses.id))
      .innerJoin(courseTees, eq(rounds.teeId, courseTees.id))
      .where(eq(rounds.playerId, playerId))
      .orderBy(desc(rounds.roundDate))
      .limit(limit)
      .offset(offset);

    const roundSummaries: RoundSummary[] = rows.map((row) => ({
      id: row.id,
      roundDate: row.roundDate,
      status: row.status,
      grossScore: row.grossScore,
      scoreDifferential: row.scoreDifferential,
      courseName: row.courseName,
      teeColor: row.teeColor,
      par: row.par,
    }));

    return { success: true, data: { rounds: roundSummaries, total } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// deleteRound — delete an in_progress round
// ---------------------------------------------------------------------------

export async function deleteRound(roundId: string): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const round = await getRoundOwnedByPlayer(roundId, playerId);
    if (!round) {
      return { success: false, error: 'Round not found' };
    }

    if (round.status !== 'in_progress') {
      return { success: false, error: 'Only in-progress rounds can be deleted' };
    }

    await db.delete(rounds).where(eq(rounds.id, roundId));

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// abandonRound — set an in_progress round to abandoned
// ---------------------------------------------------------------------------

export async function abandonRound(
  roundId: string,
): Promise<ActionResponse<typeof rounds.$inferSelect>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const round = await getRoundOwnedByPlayer(roundId, playerId);
    if (!round) {
      return { success: false, error: 'Round not found' };
    }

    if (round.status !== 'in_progress') {
      return { success: false, error: 'Only in-progress rounds can be abandoned' };
    }

    const [updated] = await db
      .update(rounds)
      .set({ status: 'abandoned', updatedAt: new Date() })
      .where(eq(rounds.id, roundId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Failed to abandon round' };
    }

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getDashboardStats — lightweight stats for the dashboard overview
// ---------------------------------------------------------------------------

export type DashboardStats = {
  completedRoundsCount: number;
  activeMatchesCount: number;
  recentRounds: RoundSummary[];
};

export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Run all three independent queries in parallel
    const [completedCountResult, recentRows, activeCountResult] = await Promise.all([
      // Query 1: count completed rounds for the player
      db
        .select({ total: count() })
        .from(rounds)
        .where(and(eq(rounds.playerId, playerId), eq(rounds.status, 'completed'))),

      // Query 2: 5 most recent completed rounds with course and tee info
      db
        .select({
          id: rounds.id,
          roundDate: rounds.roundDate,
          status: rounds.status,
          grossScore: rounds.grossScore,
          scoreDifferential: rounds.scoreDifferential,
          courseName: courses.name,
          teeColor: courseTees.color,
          par: courseTees.par,
        })
        .from(rounds)
        .innerJoin(courses, eq(rounds.courseId, courses.id))
        .innerJoin(courseTees, eq(rounds.teeId, courseTees.id))
        .where(and(eq(rounds.playerId, playerId), eq(rounds.status, 'completed')))
        .orderBy(desc(rounds.roundDate))
        .limit(5),

      // Query 3: count active matches via single JOIN — avoids a two-step round-trip
      // and eliminates a potentially large IN(...) clause
      db
        .select({ total: count() })
        .from(matches)
        .innerJoin(matchParticipants, eq(matchParticipants.matchId, matches.id))
        .where(
          and(
            eq(matchParticipants.playerId, playerId),
            inArray(matches.status, ['open', 'in_progress']),
          ),
        ),
    ]);

    const completedRoundsCount = completedCountResult[0]?.total ?? 0;
    const activeMatchesCount = activeCountResult[0]?.total ?? 0;

    const recentRounds: RoundSummary[] = recentRows.map((row) => ({
      id: row.id,
      roundDate: row.roundDate,
      status: row.status,
      grossScore: row.grossScore,
      scoreDifferential: row.scoreDifferential,
      courseName: row.courseName,
      teeColor: row.teeColor,
      par: row.par,
    }));

    return {
      success: true,
      data: { completedRoundsCount, activeMatchesCount, recentRounds },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
