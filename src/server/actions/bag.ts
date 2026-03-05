'use server';

import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import { golfBags, clubs, playerProfiles } from '@/lib/drizzle/schema';
import { eq, and, asc, max } from 'drizzle-orm';
import {
  createBagSchema,
  updateBagSchema,
  createClubSchema,
  updateClubSchema,
  reorderClubsSchema,
} from '@/lib/validations/bag';
import type {
  CreateBagInput,
  UpdateBagInput,
  CreateClubInput,
  UpdateClubInput,
  ReorderClubsInput,
} from '@/lib/validations/bag';
import type { ActionResponse } from '@/types';

type GolfBag = typeof golfBags.$inferSelect;
type Club = typeof clubs.$inferSelect;

type GolfBagWithClubs = GolfBag & {
  clubs: Club[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getPlayerIdForSession(userId: string): Promise<string | null> {
  const profile = await db
    .select({ id: playerProfiles.id })
    .from(playerProfiles)
    .where(eq(playerProfiles.userId, userId))
    .limit(1);

  return profile[0]?.id ?? null;
}

async function getBagOwnedByPlayer(bagId: string, playerId: string): Promise<GolfBag | null> {
  const result = await db
    .select()
    .from(golfBags)
    .where(and(eq(golfBags.id, bagId), eq(golfBags.playerId, playerId)))
    .limit(1);

  return result[0] ?? null;
}

async function getClubOwnedByPlayer(clubId: string, playerId: string): Promise<Club | null> {
  const result = await db
    .select({ club: clubs })
    .from(clubs)
    .innerJoin(golfBags, and(eq(clubs.bagId, golfBags.id), eq(golfBags.playerId, playerId)))
    .where(eq(clubs.id, clubId))
    .limit(1);

  return result[0]?.club ?? null;
}

// ---------------------------------------------------------------------------
// getBags — get all bags for the current user with their clubs
// ---------------------------------------------------------------------------

export async function getBags(): Promise<ActionResponse<GolfBagWithClubs[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const bagRows = await db
      .select()
      .from(golfBags)
      .where(eq(golfBags.playerId, playerId))
      .orderBy(asc(golfBags.createdAt));

    const clubRows = await db
      .select()
      .from(clubs)
      .innerJoin(golfBags, eq(clubs.bagId, golfBags.id))
      .where(eq(golfBags.playerId, playerId))
      .orderBy(asc(clubs.sortOrder));

    const bagsWithClubs: GolfBagWithClubs[] = bagRows.map((bag) => ({
      ...bag,
      clubs: clubRows.filter((row) => row.clubs.bagId === bag.id).map((row) => row.clubs),
    }));

    return { success: true, data: bagsWithClubs };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getActiveBag — get the active bag with clubs ordered by sortOrder
// ---------------------------------------------------------------------------

export async function getActiveBag(): Promise<ActionResponse<GolfBagWithClubs>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const bagResult = await db
      .select()
      .from(golfBags)
      .where(and(eq(golfBags.playerId, playerId), eq(golfBags.isActive, true)))
      .limit(1);

    const bag = bagResult[0];
    if (!bag) {
      return { success: false, error: 'No active bag found' };
    }

    const clubRows = await db
      .select()
      .from(clubs)
      .where(eq(clubs.bagId, bag.id))
      .orderBy(asc(clubs.sortOrder));

    return { success: true, data: { ...bag, clubs: clubRows } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// createBag — create a new bag for the current user
// ---------------------------------------------------------------------------

export async function createBag(data: CreateBagInput): Promise<ActionResponse<GolfBag>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = createBagSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const [bag] = await db
      .insert(golfBags)
      .values({
        playerId,
        name: parsed.data.name,
        isActive: false,
      })
      .returning();

    if (!bag) {
      return { success: false, error: 'Failed to create bag' };
    }

    return { success: true, data: bag };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// updateBag — update a bag's name
// ---------------------------------------------------------------------------

export async function updateBag(
  bagId: string,
  data: UpdateBagInput,
): Promise<ActionResponse<GolfBag>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = updateBagSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const existing = await getBagOwnedByPlayer(bagId, playerId);
    if (!existing) {
      return { success: false, error: 'Bag not found' };
    }

    const updateValues: Partial<typeof golfBags.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (parsed.data.name !== undefined) {
      updateValues.name = parsed.data.name;
    }

    const [updated] = await db
      .update(golfBags)
      .set(updateValues)
      .where(eq(golfBags.id, bagId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Failed to update bag' };
    }

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// deleteBag — delete a bag (only if it is not the last one)
// ---------------------------------------------------------------------------

export async function deleteBag(bagId: string): Promise<ActionResponse<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const existing = await getBagOwnedByPlayer(bagId, playerId);
    if (!existing) {
      return { success: false, error: 'Bag not found' };
    }

    const allBags = await db
      .select({ id: golfBags.id })
      .from(golfBags)
      .where(eq(golfBags.playerId, playerId));

    if (allBags.length <= 1) {
      return { success: false, error: 'Cannot delete the last bag' };
    }

    await db.delete(golfBags).where(eq(golfBags.id, bagId));

    // If the deleted bag was active, activate the most recently created remaining bag
    if (existing.isActive) {
      const remainingBags = await db
        .select({ id: golfBags.id })
        .from(golfBags)
        .where(eq(golfBags.playerId, playerId))
        .orderBy(asc(golfBags.createdAt))
        .limit(1);

      if (remainingBags[0]) {
        await db
          .update(golfBags)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(golfBags.id, remainingBags[0].id));
      }
    }

    return { success: true, data: { id: bagId } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// setActiveBag — set a bag as active and deactivate all others
// ---------------------------------------------------------------------------

export async function setActiveBag(bagId: string): Promise<ActionResponse<GolfBag>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const existing = await getBagOwnedByPlayer(bagId, playerId);
    if (!existing) {
      return { success: false, error: 'Bag not found' };
    }

    // Deactivate all bags for this player
    await db
      .update(golfBags)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(golfBags.playerId, playerId));

    // Activate the requested bag
    const [updated] = await db
      .update(golfBags)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(golfBags.id, bagId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Failed to set active bag' };
    }

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// addClub — add a club to a bag
// ---------------------------------------------------------------------------

export async function addClub(bagId: string, data: CreateClubInput): Promise<ActionResponse<Club>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = createClubSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const bag = await getBagOwnedByPlayer(bagId, playerId);
    if (!bag) {
      return { success: false, error: 'Bag not found' };
    }

    // Determine the next sortOrder (max + 1)
    const maxResult = await db
      .select({ maxOrder: max(clubs.sortOrder) })
      .from(clubs)
      .where(eq(clubs.bagId, bagId));

    const nextSortOrder = (maxResult[0]?.maxOrder ?? -1) + 1;

    const [club] = await db
      .insert(clubs)
      .values({
        bagId,
        clubType: parsed.data.clubType,
        brand: parsed.data.brand,
        model: parsed.data.model,
        loft: parsed.data.loft !== undefined ? String(parsed.data.loft) : null,
        carryDistance: parsed.data.carryDistance ?? null,
        totalDistance: parsed.data.totalDistance ?? null,
        shaftType: parsed.data.shaftType ?? null,
        shaftFlex: parsed.data.shaftFlex ?? null,
        sortOrder: nextSortOrder,
      })
      .returning();

    if (!club) {
      return { success: false, error: 'Failed to add club' };
    }

    return { success: true, data: club };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// updateClub — update a club's details
// ---------------------------------------------------------------------------

export async function updateClub(
  clubId: string,
  data: UpdateClubInput,
): Promise<ActionResponse<Club>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = updateClubSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const existing = await getClubOwnedByPlayer(clubId, playerId);
    if (!existing) {
      return { success: false, error: 'Club not found' };
    }

    const updateValues: Partial<typeof clubs.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (parsed.data.clubType !== undefined) updateValues.clubType = parsed.data.clubType;
    if (parsed.data.brand !== undefined) updateValues.brand = parsed.data.brand;
    if (parsed.data.model !== undefined) updateValues.model = parsed.data.model;
    if (parsed.data.loft !== undefined) updateValues.loft = String(parsed.data.loft);
    if (parsed.data.carryDistance !== undefined)
      updateValues.carryDistance = parsed.data.carryDistance;
    if (parsed.data.totalDistance !== undefined)
      updateValues.totalDistance = parsed.data.totalDistance;
    if (parsed.data.shaftType !== undefined) updateValues.shaftType = parsed.data.shaftType;
    if (parsed.data.shaftFlex !== undefined) updateValues.shaftFlex = parsed.data.shaftFlex;

    const [updated] = await db
      .update(clubs)
      .set(updateValues)
      .where(eq(clubs.id, clubId))
      .returning();

    if (!updated) {
      return { success: false, error: 'Failed to update club' };
    }

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// deleteClub — remove a club from a bag
// ---------------------------------------------------------------------------

export async function deleteClub(clubId: string): Promise<ActionResponse<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    const existing = await getClubOwnedByPlayer(clubId, playerId);
    if (!existing) {
      return { success: false, error: 'Club not found' };
    }

    await db.delete(clubs).where(eq(clubs.id, clubId));

    return { success: true, data: { id: clubId } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// reorderClubs — update sortOrder for multiple clubs at once
// ---------------------------------------------------------------------------

export async function reorderClubs(
  data: ReorderClubsInput,
): Promise<ActionResponse<{ updated: number }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = reorderClubsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  if (parsed.data.length === 0) {
    return { success: true, data: { updated: 0 } };
  }

  try {
    const playerId = await getPlayerIdForSession(session.user.id);
    if (!playerId) {
      return { success: false, error: 'Player profile not found' };
    }

    // Verify all clubs belong to this player
    for (const item of parsed.data) {
      const existing = await getClubOwnedByPlayer(item.clubId, playerId);
      if (!existing) {
        return { success: false, error: `Club ${item.clubId} not found` };
      }
    }

    // Update sortOrder for each club
    await Promise.all(
      parsed.data.map((item) =>
        db
          .update(clubs)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(clubs.id, item.clubId)),
      ),
    );

    return { success: true, data: { updated: parsed.data.length } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
