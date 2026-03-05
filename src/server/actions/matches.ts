'use server';

import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import {
  matches,
  matchParticipants,
  playerProfiles,
  courses,
  users,
  invitations,
  notifications,
  rounds,
} from '@/lib/drizzle/schema';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';
import { createMatchSchema, updateMatchSchema, inviteToMatchSchema } from '@/lib/validations/match';
import type { CreateMatchInput, UpdateMatchInput } from '@/lib/validations/match';
import type { ActionResponse, MatchStatus } from '@/types';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MatchSummary = {
  id: string;
  name: string;
  matchDate: string | null;
  teeTime: string | null;
  format: string;
  status: string;
  courseName: string;
  participantCount: number;
  maxPlayers: number;
  creatorId: string;
};

export type MatchParticipant = {
  playerId: string;
  displayName: string;
  avatarUrl: string | null;
  handicapIndex: string | null;
  inviteStatus: 'accepted' | 'invited' | 'declined';
  isCreator: boolean;
};

export type MatchWithDetails = {
  id: string;
  name: string;
  matchDate: string | null;
  teeTime: string | null;
  format: string;
  status: string;
  scoringType: string;
  maxPlayers: number;
  isPrivate: boolean;
  creatorId: string;
  courseId: string | null;
  courseName: string;
  courseCity: string | null;
  courseCountry: string | null;
  participants: MatchParticipant[];
};

export type LeaderboardEntry = {
  position: number;
  playerId: string;
  displayName: string;
  avatarUrl: string | null;
  grossScore: number | null;
  netScore: number | null;
  stablefordPoints: number | null;
  scoreDifferential: number | null;
};

export type CreateMatchData = {
  name: string;
  courseId: string;
  matchDate: string;
  teeTime?: string;
  format: string;
  scoringType: 'gross' | 'net';
  maxPlayers: number;
  isPrivate: boolean;
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

async function getMatchOwnedByPlayer(
  matchId: string,
  playerId: string,
): Promise<typeof matches.$inferSelect | null> {
  const result = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.creatorId, playerId)))
    .limit(1);

  return result[0] ?? null;
}

// ---------------------------------------------------------------------------
// createMatch — create a new match with creator as first participant
// ---------------------------------------------------------------------------

export async function createMatch(data: CreateMatchInput): Promise<ActionResponse<MatchSummary>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = createMatchSchema.safeParse(data);
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
      .select({ id: courses.id, name: courses.name })
      .from(courses)
      .where(eq(courses.id, parsed.data.courseId))
      .limit(1);

    if (!courseResult[0]) {
      return { success: false, error: 'Course not found' };
    }

    const [match] = await db
      .insert(matches)
      .values({
        creatorId: playerId,
        courseId: parsed.data.courseId,
        name: parsed.data.name,
        matchDate: parsed.data.matchDate,
        teeTime: parsed.data.teeTime ?? null,
        format: parsed.data.format,
        scoringType: parsed.data.scoringType,
        maxPlayers: parsed.data.maxPlayers,
        isPrivate: parsed.data.isPrivate,
        status: 'open',
      })
      .returning();

    if (!match) {
      return { success: false, error: 'Failed to create match' };
    }

    // Add creator as first participant with accepted status
    await db.insert(matchParticipants).values({
      matchId: match.id,
      playerId,
      status: 'accepted',
    });

    const matchSummary: MatchSummary = {
      id: match.id,
      name: match.name,
      matchDate: match.matchDate,
      teeTime: match.teeTime,
      format: match.format,
      status: match.status,
      courseName: courseResult[0].name,
      participantCount: 1,
      maxPlayers: match.maxPlayers,
      creatorId: match.creatorId,
    };

    return { success: true, data: matchSummary };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getMatch — get a match with participants and course info
// ---------------------------------------------------------------------------

export async function getMatch(matchId: string): Promise<ActionResponse<MatchWithDetails>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const matchResult = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);

    const match = matchResult[0];
    if (!match) {
      return { success: false, error: 'Match not found' };
    }

    // Fetch participants with player info
    const participantRows = await db
      .select({
        playerId: matchParticipants.playerId,
        status: matchParticipants.status,
        displayName: playerProfiles.displayName,
        avatarUrl: playerProfiles.avatarUrl,
        handicapIndex: playerProfiles.handicapIndex,
      })
      .from(matchParticipants)
      .innerJoin(playerProfiles, eq(matchParticipants.playerId, playerProfiles.id))
      .where(eq(matchParticipants.matchId, matchId));

    const participants: MatchParticipant[] = participantRows.map((row) => ({
      playerId: row.playerId,
      displayName: row.displayName ?? '',
      avatarUrl: row.avatarUrl,
      handicapIndex: row.handicapIndex,
      inviteStatus: row.status as 'accepted' | 'invited' | 'declined',
      isCreator: row.playerId === match.creatorId,
    }));

    // Fetch course info
    let courseData = {
      name: '',
      city: null as string | null,
      country: null as string | null,
    };

    if (match.courseId) {
      const courseResult = await db
        .select({
          name: courses.name,
          city: courses.city,
          country: courses.country,
        })
        .from(courses)
        .where(eq(courses.id, match.courseId))
        .limit(1);

      if (courseResult[0]) {
        courseData = courseResult[0];
      }
    }

    const matchWithDetails: MatchWithDetails = {
      id: match.id,
      name: match.name,
      matchDate: match.matchDate,
      teeTime: match.teeTime,
      format: match.format,
      status: match.status,
      scoringType: match.scoringType,
      maxPlayers: match.maxPlayers,
      isPrivate: match.isPrivate,
      creatorId: match.creatorId,
      courseId: match.courseId,
      courseName: courseData.name,
      courseCity: courseData.city,
      courseCountry: courseData.country,
      participants,
    };

    return { success: true, data: matchWithDetails };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getMyMatches — get matches where current player is a participant
// ---------------------------------------------------------------------------

export async function getMyMatches(
  status?: MatchStatus,
  limit = 20,
): Promise<ActionResponse<MatchSummary[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Find match IDs the player participates in
    const participantMatchIds = await db
      .select({ matchId: matchParticipants.matchId })
      .from(matchParticipants)
      .where(eq(matchParticipants.playerId, playerId));

    const matchIds = participantMatchIds.map((row) => row.matchId);

    if (matchIds.length === 0) {
      return { success: true, data: [] };
    }

    const whereCondition =
      status !== undefined
        ? and(inArray(matches.id, matchIds), eq(matches.status, status))
        : inArray(matches.id, matchIds);

    const rows = await db
      .select({
        id: matches.id,
        name: matches.name,
        matchDate: matches.matchDate,
        teeTime: matches.teeTime,
        format: matches.format,
        status: matches.status,
        maxPlayers: matches.maxPlayers,
        creatorId: matches.creatorId,
        courseName: courses.name,
      })
      .from(matches)
      .leftJoin(courses, eq(matches.courseId, courses.id))
      .where(whereCondition)
      .orderBy(desc(matches.matchDate))
      .limit(limit);

    // Get participant counts for each match
    const matchSummaries: MatchSummary[] = await Promise.all(
      rows.map(async (row) => {
        const countResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(matchParticipants)
          .where(eq(matchParticipants.matchId, row.id));

        const participantCount = countResult[0]?.count ?? 0;

        return {
          id: row.id,
          name: row.name,
          matchDate: row.matchDate,
          teeTime: row.teeTime,
          format: row.format,
          status: row.status,
          courseName: row.courseName ?? '',
          participantCount,
          maxPlayers: row.maxPlayers,
          creatorId: row.creatorId,
        };
      }),
    );

    return { success: true, data: matchSummaries };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// inviteToMatch — invite a player by email (creator only)
// ---------------------------------------------------------------------------

export async function inviteToMatch(matchId: string, email: string): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = inviteToMatchSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const match = await getMatchOwnedByPlayer(matchId, playerId);
    if (!match) {
      return { success: false, error: 'Match not found or you are not the creator' };
    }

    // Check max players not exceeded
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(matchParticipants)
      .where(eq(matchParticipants.matchId, matchId));

    const currentCount = countResult[0]?.count ?? 0;
    if (currentCount >= match.maxPlayers) {
      return { success: false, error: 'Match is full' };
    }

    // Create invitation token with 48h expiry
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Check if invitee has an account
    const inviteeUserResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    const inviteeUser = inviteeUserResult[0];

    let inviteePlayerId: string | undefined;
    if (inviteeUser) {
      const inviteeProfileResult = await db
        .select({ id: playerProfiles.id })
        .from(playerProfiles)
        .where(eq(playerProfiles.userId, inviteeUser.id))
        .limit(1);

      inviteePlayerId = inviteeProfileResult[0]?.id;
    }

    // Create invitation record
    await db.insert(invitations).values({
      inviterId: playerId,
      inviteeEmail: parsed.data.email,
      inviteeId: inviteePlayerId ?? null,
      invitationType: 'match',
      referenceId: matchId,
      token,
      status: 'pending',
      expiresAt,
    });

    // If invitee has an account, add as participant (invited) and notify
    if (inviteePlayerId && inviteeUser) {
      // Check not already a participant
      const existingParticipant = await db
        .select({ id: matchParticipants.id })
        .from(matchParticipants)
        .where(
          and(
            eq(matchParticipants.matchId, matchId),
            eq(matchParticipants.playerId, inviteePlayerId),
          ),
        )
        .limit(1);

      if (!existingParticipant[0]) {
        await db.insert(matchParticipants).values({
          matchId,
          playerId: inviteePlayerId,
          status: 'invited',
        });

        await db.insert(notifications).values({
          userId: inviteeUser.id,
          type: 'match_invite',
          title: 'Match Invitation',
          message: `You have been invited to join: ${match.name}`,
          referenceType: 'match',
          referenceId: matchId,
        });
      }
    }

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// respondToMatchInvite — accept or decline a match invitation
// ---------------------------------------------------------------------------

export async function respondToMatchInvite(
  matchId: string,
  accept: boolean,
): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const participantResult = await db
      .select()
      .from(matchParticipants)
      .where(and(eq(matchParticipants.matchId, matchId), eq(matchParticipants.playerId, playerId)))
      .limit(1);

    const participant = participantResult[0];
    if (!participant) {
      return { success: false, error: 'Invitation not found' };
    }

    if (participant.status !== 'invited') {
      return { success: false, error: 'No pending invitation for this match' };
    }

    const newStatus = accept ? 'accepted' : 'declined';

    await db
      .update(matchParticipants)
      .set({ status: newStatus })
      .where(eq(matchParticipants.id, participant.id));

    // Notify the match creator
    const matchResult = await db
      .select({ creatorId: matches.creatorId, name: matches.name })
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    const match = matchResult[0];
    if (match) {
      const creatorProfileResult = await db
        .select({ userId: playerProfiles.userId })
        .from(playerProfiles)
        .where(eq(playerProfiles.id, match.creatorId))
        .limit(1);

      const creatorProfile = creatorProfileResult[0];
      if (creatorProfile) {
        const respondentResult = await db
          .select({ displayName: playerProfiles.displayName })
          .from(playerProfiles)
          .where(eq(playerProfiles.id, playerId))
          .limit(1);

        const respondentName = respondentResult[0]?.displayName ?? 'A player';
        const action = accept ? 'accepted' : 'declined';

        await db.insert(notifications).values({
          userId: creatorProfile.userId,
          type: 'match_invite',
          title: `Match Invitation ${accept ? 'Accepted' : 'Declined'}`,
          message: `${respondentName} has ${action} the invitation to: ${match.name}`,
          referenceType: 'match',
          referenceId: matchId,
        });
      }
    }

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getMatchLeaderboard — ranked participants by format scoring
// ---------------------------------------------------------------------------

export async function getMatchLeaderboard(
  matchId: string,
): Promise<ActionResponse<LeaderboardEntry[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const matchResult = await db
      .select({ format: matches.format })
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    const match = matchResult[0];
    if (!match) {
      return { success: false, error: 'Match not found' };
    }

    // Get accepted participants with player info
    const participantRows = await db
      .select({
        playerId: matchParticipants.playerId,
        displayName: playerProfiles.displayName,
        avatarUrl: playerProfiles.avatarUrl,
      })
      .from(matchParticipants)
      .innerJoin(playerProfiles, eq(matchParticipants.playerId, playerProfiles.id))
      .where(and(eq(matchParticipants.matchId, matchId), eq(matchParticipants.status, 'accepted')));

    type ScoredEntry = {
      position: number;
      playerId: string;
      displayName: string;
      avatarUrl: string | null;
      grossScore: number | null;
      netScore: number | null;
      stablefordPoints: number | null;
      scoreDifferential: number | null;
      sortKey: number;
    };

    const entries: ScoredEntry[] = await Promise.all(
      participantRows.map(async (participant) => {
        const roundResult = await db
          .select({
            grossScore: rounds.grossScore,
            netScore: rounds.netScore,
            stablefordPoints: rounds.stablefordPoints,
            scoreDifferential: rounds.scoreDifferential,
          })
          .from(rounds)
          .where(
            and(
              eq(rounds.matchId, matchId),
              eq(rounds.playerId, participant.playerId),
              eq(rounds.status, 'completed'),
            ),
          )
          .orderBy(desc(rounds.completedAt))
          .limit(1);

        const round = roundResult[0];

        // Determine sort key based on format
        let sortKey: number;
        if (match.format === 'stableford') {
          // Higher points = better (negate for ascending sort)
          sortKey = -(round?.stablefordPoints ?? 0);
        } else if (match.format === 'stroke_play') {
          // Lower gross score = better
          sortKey = round?.grossScore ?? Number.MAX_SAFE_INTEGER;
        } else {
          // net / match_play / skins — use net score if available, else gross
          sortKey = round?.netScore ?? round?.grossScore ?? Number.MAX_SAFE_INTEGER;
        }

        const differential = round?.scoreDifferential ? parseFloat(round.scoreDifferential) : null;

        return {
          position: 0,
          playerId: participant.playerId,
          displayName: participant.displayName ?? '',
          avatarUrl: participant.avatarUrl,
          grossScore: round?.grossScore ?? null,
          netScore: round?.netScore ?? null,
          stablefordPoints: round?.stablefordPoints ?? null,
          scoreDifferential: differential,
          sortKey,
        };
      }),
    );

    // Sort ascending by sortKey
    entries.sort((a, b) => a.sortKey - b.sortKey);

    // Assign positions (handle ties — same sortKey = same position)
    const leaderboard: LeaderboardEntry[] = entries.map((entry, index) => {
      const { sortKey: _, ...rest } = entry; // eslint-disable-line no-unused-vars
      const previousEntry = index > 0 ? entries[index - 1] : undefined;
      const position =
        previousEntry !== undefined && previousEntry.sortKey === entry.sortKey
          ? previousEntry.position
          : index + 1;

      return { ...rest, position };
    });

    return { success: true, data: leaderboard };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// updateMatch — update match details (creator only)
// ---------------------------------------------------------------------------

export async function updateMatch(
  matchId: string,
  data: UpdateMatchInput,
): Promise<ActionResponse<MatchSummary>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = updateMatchSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const existingMatch = await getMatchOwnedByPlayer(matchId, playerId);
    if (!existingMatch) {
      return { success: false, error: 'Match not found or you are not the creator' };
    }

    // If courseId changes, verify it exists
    if (parsed.data.courseId) {
      const courseResult = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.id, parsed.data.courseId))
        .limit(1);

      if (!courseResult[0]) {
        return { success: false, error: 'Course not found' };
      }
    }

    const updateValues: Partial<typeof matches.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (parsed.data.name !== undefined) updateValues.name = parsed.data.name;
    if (parsed.data.courseId !== undefined) updateValues.courseId = parsed.data.courseId;
    if (parsed.data.matchDate !== undefined) updateValues.matchDate = parsed.data.matchDate;
    if (parsed.data.teeTime !== undefined) updateValues.teeTime = parsed.data.teeTime;
    if (parsed.data.format !== undefined) updateValues.format = parsed.data.format;
    if (parsed.data.scoringType !== undefined) updateValues.scoringType = parsed.data.scoringType;
    if (parsed.data.maxPlayers !== undefined) updateValues.maxPlayers = parsed.data.maxPlayers;
    if (parsed.data.isPrivate !== undefined) updateValues.isPrivate = parsed.data.isPrivate;

    const [updated] = await db
      .update(matches)
      .set(updateValues)
      .where(eq(matches.id, matchId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Failed to update match' };
    }

    // Fetch course name for response
    let courseName = '';
    const courseId = updated.courseId;
    if (courseId) {
      const courseResult = await db
        .select({ name: courses.name })
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);
      courseName = courseResult[0]?.name ?? '';
    }

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(matchParticipants)
      .where(eq(matchParticipants.matchId, matchId));

    const participantCount = countResult[0]?.count ?? 0;

    const matchSummary: MatchSummary = {
      id: updated.id,
      name: updated.name,
      matchDate: updated.matchDate,
      teeTime: updated.teeTime,
      format: updated.format,
      status: updated.status,
      courseName,
      participantCount,
      maxPlayers: updated.maxPlayers,
      creatorId: updated.creatorId,
    };

    return { success: true, data: matchSummary };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// deleteMatch — delete a match (creator only, draft/open only)
// ---------------------------------------------------------------------------

export async function deleteMatch(matchId: string): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const match = await getMatchOwnedByPlayer(matchId, playerId);
    if (!match) {
      return { success: false, error: 'Match not found or you are not the creator' };
    }

    const upcomingStatuses: string[] = ['draft', 'open'];
    if (!upcomingStatuses.includes(match.status)) {
      return { success: false, error: 'Only draft or open matches can be deleted' };
    }

    await db.delete(matches).where(eq(matches.id, matchId));

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
