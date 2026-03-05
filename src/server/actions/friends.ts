'use server';

import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import { playerProfiles, friendships, notifications } from '@/lib/drizzle/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { sendFriendRequestSchema, respondFriendRequestSchema } from '@/lib/validations/social';
import type { ActionResponse } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FriendInfo = {
  friendshipId: string;
  playerId: string;
  displayName: string;
  avatarUrl: string | null;
  handicapIndex: string | null;
  country: string | null;
};

export type FriendRequestInfo = {
  friendshipId: string;
  playerId: string;
  displayName: string;
  avatarUrl: string | null;
  requestedAt: string;
};

export type PendingRequests = {
  incoming: FriendRequestInfo[];
  outgoing: FriendRequestInfo[];
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
// sendFriendRequest — send a friend request to another player
// ---------------------------------------------------------------------------

export async function sendFriendRequest(addresseeId: string): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = sendFriendRequestSchema.safeParse({ addresseeId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const requesterId = await getPlayerIdForSession(session.user.id);
    if (!requesterId) {
      return { success: false, error: 'Player profile not found' };
    }

    if (requesterId === parsed.data.addresseeId) {
      return { success: false, error: 'Cannot send a friend request to yourself' };
    }

    // Verify addressee exists
    const addresseeResult = await db
      .select({ id: playerProfiles.id, userId: playerProfiles.userId })
      .from(playerProfiles)
      .where(eq(playerProfiles.id, parsed.data.addresseeId))
      .limit(1);

    if (!addresseeResult[0]) {
      return { success: false, error: 'Player not found' };
    }

    // Check not already friends or pending request exists (either direction)
    const existingResult = await db
      .select({ id: friendships.id, status: friendships.status })
      .from(friendships)
      .where(
        or(
          and(
            eq(friendships.requesterId, requesterId),
            eq(friendships.addresseeId, parsed.data.addresseeId),
          ),
          and(
            eq(friendships.requesterId, parsed.data.addresseeId),
            eq(friendships.addresseeId, requesterId),
          ),
        ),
      )
      .limit(1);

    const existing = existingResult[0];
    if (existing) {
      if (existing.status === 'accepted') {
        return { success: false, error: 'You are already friends with this player' };
      }
      if (existing.status === 'pending') {
        return { success: false, error: 'A friend request is already pending' };
      }
    }

    await db.insert(friendships).values({
      requesterId,
      addresseeId: parsed.data.addresseeId,
      status: 'pending',
    });

    // Notify the addressee
    const addresseeProfile = addresseeResult[0];
    const requesterResult = await db
      .select({ displayName: playerProfiles.displayName, userId: playerProfiles.userId })
      .from(playerProfiles)
      .where(eq(playerProfiles.id, requesterId))
      .limit(1);

    const requesterProfile = requesterResult[0];
    const requesterName = requesterProfile?.displayName ?? 'Someone';

    await db.insert(notifications).values({
      userId: addresseeProfile.userId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${requesterName} sent you a friend request`,
      referenceType: 'friend',
      referenceId: requesterId,
    });

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// respondToFriendRequest — accept or decline a friend request
// ---------------------------------------------------------------------------

export async function respondToFriendRequest(
  requestId: string,
  accept: boolean,
): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = respondFriendRequestSchema.safeParse({
    requestId,
    action: accept ? 'accept' : 'decline',
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Find friendship — current user must be the addressee
    const friendshipResult = await db
      .select()
      .from(friendships)
      .where(and(eq(friendships.id, parsed.data.requestId), eq(friendships.addresseeId, playerId)))
      .limit(1);

    const friendship = friendshipResult[0];
    if (!friendship) {
      return { success: false, error: 'Friend request not found' };
    }

    if (friendship.status !== 'pending') {
      return { success: false, error: 'This request has already been responded to' };
    }

    const newStatus = accept ? 'accepted' : 'declined';

    await db
      .update(friendships)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(friendships.id, parsed.data.requestId));

    // If accepted, notify the requester
    if (accept) {
      const requesterProfileResult = await db
        .select({ userId: playerProfiles.userId })
        .from(playerProfiles)
        .where(eq(playerProfiles.id, friendship.requesterId))
        .limit(1);

      const requesterProfile = requesterProfileResult[0];
      if (requesterProfile) {
        const respondentResult = await db
          .select({ displayName: playerProfiles.displayName })
          .from(playerProfiles)
          .where(eq(playerProfiles.id, playerId))
          .limit(1);

        const respondentName = respondentResult[0]?.displayName ?? 'Someone';

        await db.insert(notifications).values({
          userId: requesterProfile.userId,
          type: 'friend_accepted',
          title: 'Friend Request Accepted',
          message: `${respondentName} accepted your friend request`,
          referenceType: 'friend',
          referenceId: playerId,
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
// getFriends — get all accepted friends with player info
// ---------------------------------------------------------------------------

export async function getFriends(): Promise<ActionResponse<FriendInfo[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Get all accepted friendships where player is requester or addressee
    const friendshipRows = await db
      .select()
      .from(friendships)
      .where(
        and(
          or(eq(friendships.requesterId, playerId), eq(friendships.addresseeId, playerId)),
          eq(friendships.status, 'accepted'),
        ),
      );

    // Determine the friend's player ID for each friendship
    const friendPlayerIds = friendshipRows.map((row) =>
      row.requesterId === playerId ? row.addresseeId : row.requesterId,
    );

    if (friendPlayerIds.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch player profiles for all friends
    const profileRows = await db
      .select({
        id: playerProfiles.id,
        displayName: playerProfiles.displayName,
        avatarUrl: playerProfiles.avatarUrl,
        handicapIndex: playerProfiles.handicapIndex,
        country: playerProfiles.country,
      })
      .from(playerProfiles)
      .where(inArray(playerProfiles.id, friendPlayerIds));

    // Build a lookup map
    const profileMap = new Map(profileRows.map((p) => [p.id, p]));

    const friends: FriendInfo[] = friendshipRows.map((row) => {
      const friendId = row.requesterId === playerId ? row.addresseeId : row.requesterId;
      const profile = profileMap.get(friendId);

      return {
        friendshipId: row.id,
        playerId: friendId,
        displayName: profile?.displayName ?? '',
        avatarUrl: profile?.avatarUrl ?? null,
        handicapIndex: profile?.handicapIndex ?? null,
        country: profile?.country ?? null,
      };
    });

    return { success: true, data: friends };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getPendingRequests — get incoming and outgoing pending requests
// ---------------------------------------------------------------------------

export async function getPendingRequests(): Promise<ActionResponse<PendingRequests>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Incoming: player is the addressee
    const incomingRows = await db
      .select({
        id: friendships.id,
        requesterId: friendships.requesterId,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .where(and(eq(friendships.addresseeId, playerId), eq(friendships.status, 'pending')));

    // Outgoing: player is the requester
    const outgoingRows = await db
      .select({
        id: friendships.id,
        addresseeId: friendships.addresseeId,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .where(and(eq(friendships.requesterId, playerId), eq(friendships.status, 'pending')));

    // Fetch profiles for incoming requesters
    const incomingRequesterIds = incomingRows.map((row) => row.requesterId);
    const outgoingAddresseeIds = outgoingRows.map((row) => row.addresseeId);

    const allPlayerIds = [...incomingRequesterIds, ...outgoingAddresseeIds];

    let profileMap = new Map<string, { displayName: string | null; avatarUrl: string | null }>();

    if (allPlayerIds.length > 0) {
      const profileRows = await db
        .select({
          id: playerProfiles.id,
          displayName: playerProfiles.displayName,
          avatarUrl: playerProfiles.avatarUrl,
        })
        .from(playerProfiles)
        .where(inArray(playerProfiles.id, allPlayerIds));

      profileMap = new Map(profileRows.map((p) => [p.id, p]));
    }

    const incoming: FriendRequestInfo[] = incomingRows.map((row) => {
      const profile = profileMap.get(row.requesterId);
      return {
        friendshipId: row.id,
        playerId: row.requesterId,
        displayName: profile?.displayName ?? '',
        avatarUrl: profile?.avatarUrl ?? null,
        requestedAt: row.createdAt.toISOString(),
      };
    });

    const outgoing: FriendRequestInfo[] = outgoingRows.map((row) => {
      const profile = profileMap.get(row.addresseeId);
      return {
        friendshipId: row.id,
        playerId: row.addresseeId,
        displayName: profile?.displayName ?? '',
        avatarUrl: profile?.avatarUrl ?? null,
        requestedAt: row.createdAt.toISOString(),
      };
    });

    return { success: true, data: { incoming, outgoing } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// removeFriend — delete a friendship
// ---------------------------------------------------------------------------

export async function removeFriend(friendshipId: string): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Verify the friendship belongs to this player
    const friendshipResult = await db
      .select({ id: friendships.id })
      .from(friendships)
      .where(
        and(
          eq(friendships.id, friendshipId),
          or(eq(friendships.requesterId, playerId), eq(friendships.addresseeId, playerId)),
        ),
      )
      .limit(1);

    if (!friendshipResult[0]) {
      return { success: false, error: 'Friendship not found' };
    }

    await db.delete(friendships).where(eq(friendships.id, friendshipId));

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
