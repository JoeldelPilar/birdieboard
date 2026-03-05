/**
 * World Handicap System (WHS) calculation engine.
 *
 * Score Differential = (113 / Slope Rating) × (Adjusted Gross Score - Course Rating - PCC)
 * Handicap Index = Average of best 8 differentials from last 20 rounds
 * Course Handicap = (Handicap Index) × (Slope Rating / 113) + (Course Rating - Par)
 */

export interface RoundData {
  adjustedGrossScore: number;
  courseRating: number;
  slopeRating: number;
  par: number;
  pcc?: number; // Playing Conditions Calculation, defaults to 0
}

export function calculateScoreDifferential(round: RoundData): number {
  const pcc = round.pcc ?? 0;
  const differential =
    (113 / round.slopeRating) * (round.adjustedGrossScore - round.courseRating - pcc);
  return Math.round(differential * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate Handicap Index from score differentials.
 * Uses the WHS lookup table for how many differentials to use.
 */
export function calculateHandicapIndex(differentials: number[]): number | null {
  if (differentials.length < 3) return null; // Need at least 3 rounds

  // Sort ascending
  const sorted = [...differentials].sort((a, b) => a - b);

  // WHS lookup: number of rounds -> number of best differentials to use -> adjustment
  const lookup: Record<number, { count: number; adjustment: number }> = {
    3: { count: 1, adjustment: -2.0 },
    4: { count: 1, adjustment: -1.0 },
    5: { count: 1, adjustment: 0 },
    6: { count: 2, adjustment: -1.0 },
    7: { count: 2, adjustment: 0 },
    8: { count: 2, adjustment: 0 },
    9: { count: 3, adjustment: 0 },
    10: { count: 3, adjustment: 0 },
    11: { count: 3, adjustment: 0 },
    12: { count: 4, adjustment: 0 },
    13: { count: 4, adjustment: 0 },
    14: { count: 4, adjustment: 0 },
    15: { count: 5, adjustment: 0 },
    16: { count: 5, adjustment: 0 },
    17: { count: 6, adjustment: 0 },
    18: { count: 6, adjustment: 0 },
    19: { count: 7, adjustment: 0 },
    20: { count: 8, adjustment: 0 },
  };

  // Use last 20 rounds max
  const recent = sorted.slice(0, Math.min(differentials.length, 20));
  const roundCount = Math.min(recent.length, 20);

  const config = lookup[roundCount];
  if (!config) return null;

  const best = recent.slice(0, config.count);
  const average = best.reduce((sum, d) => sum + d, 0) / best.length;
  const index = average + config.adjustment;

  // Cap at 54.0
  return Math.min(Math.round(index * 10) / 10, 54.0);
}

export function calculateCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number,
): number {
  const courseHcp = (handicapIndex * slopeRating) / 113 + (courseRating - par);
  return Math.round(courseHcp);
}

/**
 * Calculate Stableford points for a hole.
 * Points: Double Bogey+ = 0, Bogey = 1, Par = 2, Birdie = 3, Eagle = 4, Albatross = 5
 */
export function calculateStablefordPoints(
  strokes: number,
  par: number,
  strokesReceived: number,
): number {
  const netStrokes = strokes - strokesReceived;
  const diff = netStrokes - par;
  const points = Math.max(0, 2 - diff);
  return points;
}
