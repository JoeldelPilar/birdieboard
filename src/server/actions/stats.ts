'use server';

import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import { playerProfiles, rounds, holeScores, courses, courseHoles } from '@/lib/drizzle/schema';
import { eq, and, desc, avg, min, count, sql } from 'drizzle-orm';
import type { ActionResponse } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PlayerStats = {
  totalRounds: number;
  avgGrossScore: number | null;
  bestGrossScore: number | null;
  avgDifferential: number | null;
  bestDifferential: number | null;
  par3Avg: number | null;
  par4Avg: number | null;
  par5Avg: number | null;
  fairwayHitPct: number | null;
  girPct: number | null;
  avgPuttsPerRound: number | null;
};

export type ScoringDistributionEntry = {
  label: string;
  count: number;
  color: string;
};

export type RecentFormEntry = {
  roundId: string;
  roundDate: string;
  courseName: string;
  grossScore: number;
  scoreDifferential: number;
  stablefordPoints: number | null;
};

export type SingleRoundStats = {
  roundId: string;
  roundDate: string;
  courseName: string;
  grossScore: number;
  scoreDifferential: number | null;
  stablefordPoints: number | null;
  scoring: ScoringDistributionEntry[];
  fairwayHitPct: number | null;
  girPct: number | null;
  avgPutts: number | null;
  totalPenalties: number;
  totalHoles: number;
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

function roundToOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

// ---------------------------------------------------------------------------
// getPlayerStats — aggregate stats across all completed rounds
// ---------------------------------------------------------------------------

export async function getPlayerStats(): Promise<ActionResponse<PlayerStats>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const completedFilter = and(eq(rounds.playerId, playerId), eq(rounds.status, 'completed'));

    // Round-level aggregates
    const aggregates = await db
      .select({
        totalRounds: count(),
        avgGrossScore: avg(rounds.grossScore),
        bestGrossScore: min(rounds.grossScore),
        avgDifferential: avg(rounds.scoreDifferential),
        bestDifferential: min(rounds.scoreDifferential),
      })
      .from(rounds)
      .where(completedFilter);

    const agg = aggregates[0];

    // Average putts per round — sum putts per round then average across rounds
    const puttsResult = await db
      .select({
        roundId: holeScores.roundId,
        totalPutts: sql<number>`sum(${holeScores.putts})`,
      })
      .from(holeScores)
      .innerJoin(rounds, eq(holeScores.roundId, rounds.id))
      .where(and(completedFilter, sql`${holeScores.putts} is not null`))
      .groupBy(holeScores.roundId);

    const avgPuttsPerRound =
      puttsResult.length > 0
        ? roundToOne(puttsResult.reduce((s, r) => s + Number(r.totalPutts), 0) / puttsResult.length)
        : null;

    // FIR% — fairway hit % on par 4s and 5s only
    const firResult = await db
      .select({
        total: count(),
        hits: sql<number>`sum(case when ${holeScores.fairwayHit} = true then 1 else 0 end)`,
      })
      .from(holeScores)
      .innerJoin(rounds, eq(holeScores.roundId, rounds.id))
      .innerJoin(
        courseHoles,
        and(eq(courseHoles.teeId, rounds.teeId), eq(courseHoles.holeNumber, holeScores.holeNumber)),
      )
      .where(
        and(
          completedFilter,
          sql`${holeScores.fairwayHit} is not null`,
          sql`${courseHoles.par} >= 4`,
        ),
      );

    const firRow = firResult[0];
    const fairwayHitPct =
      firRow && Number(firRow.total) > 0
        ? roundToOne((Number(firRow.hits) / Number(firRow.total)) * 100)
        : null;

    // GIR%
    const girResult = await db
      .select({
        total: count(),
        hits: sql<number>`sum(case when ${holeScores.greenInReg} = true then 1 else 0 end)`,
      })
      .from(holeScores)
      .innerJoin(rounds, eq(holeScores.roundId, rounds.id))
      .where(and(completedFilter, sql`${holeScores.greenInReg} is not null`));

    const girRow = girResult[0];
    const girPct =
      girRow && Number(girRow.total) > 0
        ? roundToOne((Number(girRow.hits) / Number(girRow.total)) * 100)
        : null;

    // Scoring averages by par category
    const parAvgResult = await db
      .select({
        par: courseHoles.par,
        avgStrokes: avg(holeScores.strokes),
      })
      .from(holeScores)
      .innerJoin(rounds, eq(holeScores.roundId, rounds.id))
      .innerJoin(
        courseHoles,
        and(eq(courseHoles.teeId, rounds.teeId), eq(courseHoles.holeNumber, holeScores.holeNumber)),
      )
      .where(completedFilter)
      .groupBy(courseHoles.par);

    const par3Row = parAvgResult.find((r) => r.par === 3);
    const par4Row = parAvgResult.find((r) => r.par === 4);
    const par5Row = parAvgResult.find((r) => r.par === 5);

    return {
      success: true,
      data: {
        totalRounds: Number(agg?.totalRounds ?? 0),
        avgGrossScore: agg?.avgGrossScore != null ? roundToOne(Number(agg.avgGrossScore)) : null,
        bestGrossScore: agg?.bestGrossScore != null ? Number(agg.bestGrossScore) : null,
        avgDifferential:
          agg?.avgDifferential != null ? roundToOne(Number(agg.avgDifferential)) : null,
        bestDifferential:
          agg?.bestDifferential != null ? roundToOne(Number(agg.bestDifferential)) : null,
        par3Avg: par3Row?.avgStrokes != null ? roundToTwo(Number(par3Row.avgStrokes)) : null,
        par4Avg: par4Row?.avgStrokes != null ? roundToTwo(Number(par4Row.avgStrokes)) : null,
        par5Avg: par5Row?.avgStrokes != null ? roundToTwo(Number(par5Row.avgStrokes)) : null,
        fairwayHitPct,
        girPct,
        avgPuttsPerRound,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getScoringDistribution — eagle/birdie/par/bogey/etc counts across all rounds
// ---------------------------------------------------------------------------

export async function getScoringDistribution(): Promise<
  ActionResponse<ScoringDistributionEntry[]>
> {
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
      .select({
        strokes: holeScores.strokes,
        par: courseHoles.par,
      })
      .from(holeScores)
      .innerJoin(rounds, eq(holeScores.roundId, rounds.id))
      .innerJoin(
        courseHoles,
        and(eq(courseHoles.teeId, rounds.teeId), eq(courseHoles.holeNumber, holeScores.holeNumber)),
      )
      .where(and(eq(rounds.playerId, playerId), eq(rounds.status, 'completed')));

    const counts = { eagle: 0, birdie: 0, par: 0, bogey: 0, double: 0, other: 0 };

    for (const row of rows) {
      const diff = row.strokes - row.par;
      if (diff <= -2) counts.eagle++;
      else if (diff === -1) counts.birdie++;
      else if (diff === 0) counts.par++;
      else if (diff === 1) counts.bogey++;
      else if (diff === 2) counts.double++;
      else counts.other++;
    }

    const distribution: ScoringDistributionEntry[] = [
      { label: 'Eagle or better', count: counts.eagle, color: '#F59E0B' },
      { label: 'Birdie', count: counts.birdie, color: '#2D6A4F' },
      { label: 'Par', count: counts.par, color: '#40916C' },
      { label: 'Bogey', count: counts.bogey, color: '#DDB892' },
      { label: 'Double bogey', count: counts.double, color: '#F97316' },
      { label: 'Triple or worse', count: counts.other, color: '#EF4444' },
    ];

    return { success: true, data: distribution };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getRecentForm — last N completed rounds with key metrics
// ---------------------------------------------------------------------------

export async function getRecentForm(limit = 10): Promise<ActionResponse<RecentFormEntry[]>> {
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
      .select({
        roundId: rounds.id,
        roundDate: rounds.roundDate,
        courseName: courses.name,
        grossScore: rounds.grossScore,
        scoreDifferential: rounds.scoreDifferential,
        stablefordPoints: rounds.stablefordPoints,
      })
      .from(rounds)
      .innerJoin(courses, eq(rounds.courseId, courses.id))
      .where(
        and(
          eq(rounds.playerId, playerId),
          eq(rounds.status, 'completed'),
          sql`${rounds.grossScore} is not null`,
        ),
      )
      .orderBy(desc(rounds.roundDate))
      .limit(limit);

    const entries: RecentFormEntry[] = rows
      .filter((row): row is typeof row & { grossScore: number } => row.grossScore !== null)
      .map((row) => ({
        roundId: row.roundId,
        roundDate: row.roundDate,
        courseName: row.courseName,
        grossScore: row.grossScore,
        scoreDifferential: row.scoreDifferential != null ? Number(row.scoreDifferential) : 0,
        stablefordPoints: row.stablefordPoints,
      }));

    return { success: true, data: entries };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getRoundStats — detailed stats for a single completed round
// ---------------------------------------------------------------------------

export async function getRoundStats(roundId: string): Promise<ActionResponse<SingleRoundStats>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Fetch the round — must be owned by current player and completed
    const roundResult = await db
      .select({
        id: rounds.id,
        roundDate: rounds.roundDate,
        grossScore: rounds.grossScore,
        scoreDifferential: rounds.scoreDifferential,
        stablefordPoints: rounds.stablefordPoints,
        teeId: rounds.teeId,
        courseName: courses.name,
      })
      .from(rounds)
      .innerJoin(courses, eq(rounds.courseId, courses.id))
      .where(
        and(eq(rounds.id, roundId), eq(rounds.playerId, playerId), eq(rounds.status, 'completed')),
      )
      .limit(1);

    const round = roundResult[0];
    if (!round) {
      return { success: false, error: 'Round not found' };
    }

    if (round.grossScore === null) {
      return { success: false, error: 'Round has no gross score recorded' };
    }

    // Load hole scores joined to courseHoles for par per hole
    const scoreRows = await db
      .select({
        strokes: holeScores.strokes,
        putts: holeScores.putts,
        fairwayHit: holeScores.fairwayHit,
        greenInReg: holeScores.greenInReg,
        penaltyStrokes: holeScores.penaltyStrokes,
        holePar: courseHoles.par,
      })
      .from(holeScores)
      .innerJoin(
        courseHoles,
        and(eq(courseHoles.teeId, round.teeId), eq(courseHoles.holeNumber, holeScores.holeNumber)),
      )
      .where(eq(holeScores.roundId, roundId));

    const totalHoles = scoreRows.length;

    // Scoring breakdown
    const scoreCounts = { eagle: 0, birdie: 0, par: 0, bogey: 0, double: 0, other: 0 };

    for (const row of scoreRows) {
      const diff = row.strokes - row.holePar;
      if (diff <= -2) scoreCounts.eagle++;
      else if (diff === -1) scoreCounts.birdie++;
      else if (diff === 0) scoreCounts.par++;
      else if (diff === 1) scoreCounts.bogey++;
      else if (diff === 2) scoreCounts.double++;
      else scoreCounts.other++;
    }

    const scoring: ScoringDistributionEntry[] = [
      { label: 'Eagle or better', count: scoreCounts.eagle, color: '#F59E0B' },
      { label: 'Birdie', count: scoreCounts.birdie, color: '#2D6A4F' },
      { label: 'Par', count: scoreCounts.par, color: '#40916C' },
      { label: 'Bogey', count: scoreCounts.bogey, color: '#DDB892' },
      { label: 'Double bogey', count: scoreCounts.double, color: '#F97316' },
      { label: 'Triple or worse', count: scoreCounts.other, color: '#EF4444' },
    ];

    // FIR% (par 4s and 5s only — excluding par 3s where fairways don't apply)
    const firRows = scoreRows.filter((r) => r.fairwayHit !== null && r.holePar >= 4);
    const fairwayHitPct =
      firRows.length > 0
        ? roundToOne((firRows.filter((r) => r.fairwayHit === true).length / firRows.length) * 100)
        : null;

    // GIR%
    const girRows = scoreRows.filter((r) => r.greenInReg !== null);
    const girPct =
      girRows.length > 0
        ? roundToOne((girRows.filter((r) => r.greenInReg === true).length / girRows.length) * 100)
        : null;

    // Average putts per hole
    const puttRows = scoreRows.filter((r) => r.putts !== null);
    const avgPutts =
      puttRows.length > 0
        ? roundToOne(puttRows.reduce((s, r) => s + (r.putts ?? 0), 0) / puttRows.length)
        : null;

    // Total penalty strokes
    const totalPenalties = scoreRows.reduce((s, r) => s + (r.penaltyStrokes ?? 0), 0);

    return {
      success: true,
      data: {
        roundId: round.id,
        roundDate: round.roundDate,
        courseName: round.courseName,
        grossScore: round.grossScore,
        scoreDifferential: round.scoreDifferential != null ? Number(round.scoreDifferential) : null,
        stablefordPoints: round.stablefordPoints,
        scoring,
        fairwayHitPct,
        girPct,
        avgPutts,
        totalPenalties,
        totalHoles,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
