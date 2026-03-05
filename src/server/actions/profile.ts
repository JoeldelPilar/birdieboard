'use server';

import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import { playerProfiles, golfBags } from '@/lib/drizzle/schema';
import { s3, BUCKETS } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { createProfileSchema, updateProfileSchema } from '@/lib/validations/profile';
import type { CreateProfileInput, UpdateProfileInput } from '@/lib/validations/profile';
import type { ActionResponse } from '@/types';

type PlayerProfile = typeof playerProfiles.$inferSelect;

// ---------------------------------------------------------------------------
// createProfile
// ---------------------------------------------------------------------------

export async function createProfile(
  data: CreateProfileInput,
): Promise<ActionResponse<PlayerProfile>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = createProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const { displayName, handicapIndex, country, city, bio, isPublic } = parsed.data;

    const [profile] = await db
      .insert(playerProfiles)
      .values({
        userId: session.user.id,
        displayName,
        handicapIndex: handicapIndex !== undefined ? String(handicapIndex) : null,
        country: country ?? null,
        city: city ?? null,
        bio: bio ?? null,
        isPublic,
      })
      .returning();

    if (!profile) {
      return { success: false, error: 'Failed to create profile' };
    }

    // Create a default golf bag for the new player
    await db.insert(golfBags).values({
      playerId: profile.id,
      name: 'Main Bag',
      isActive: true,
    });

    return { success: true, data: profile };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    // Handle unique constraint violation — profile already exists
    if (message.includes('unique') || message.includes('duplicate')) {
      return { success: false, error: 'Profile already exists for this account' };
    }
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// updateProfile
// ---------------------------------------------------------------------------

export async function updateProfile(
  data: UpdateProfileInput,
): Promise<ActionResponse<PlayerProfile>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const { displayName, handicapIndex, country, city, bio, isPublic } = parsed.data;

    const updateValues: Partial<typeof playerProfiles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (displayName !== undefined) updateValues.displayName = displayName;
    if (handicapIndex !== undefined) updateValues.handicapIndex = String(handicapIndex);
    if (country !== undefined) updateValues.country = country;
    if (city !== undefined) updateValues.city = city;
    if (bio !== undefined) updateValues.bio = bio;
    if (isPublic !== undefined) updateValues.isPublic = isPublic;

    const [updated] = await db
      .update(playerProfiles)
      .set(updateValues)
      .where(eq(playerProfiles.userId, session.user.id))
      .returning();

    if (!updated) {
      return { success: false, error: 'Profile not found' };
    }

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getProfile
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<ActionResponse<PlayerProfile>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const profile = await db
      .select()
      .from(playerProfiles)
      .where(eq(playerProfiles.userId, session.user.id))
      .limit(1);

    if (profile.length === 0 || !profile[0]) {
      return { success: false, error: 'Profile not found' };
    }

    return { success: true, data: profile[0] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getProfileByUserId
// ---------------------------------------------------------------------------

export async function getProfileByUserId(userId: string): Promise<ActionResponse<PlayerProfile>> {
  try {
    const profile = await db
      .select()
      .from(playerProfiles)
      .where(eq(playerProfiles.userId, userId))
      .limit(1);

    if (profile.length === 0 || !profile[0]) {
      return { success: false, error: 'Profile not found' };
    }

    // Respect privacy setting — only return private profiles to the owner
    const session = await auth();
    if (!profile[0].isPublic && session?.user?.id !== userId) {
      return { success: false, error: 'Profile not found' };
    }

    return { success: true, data: profile[0] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// uploadAvatar
// ---------------------------------------------------------------------------

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadAvatar(
  formData: FormData,
): Promise<ActionResponse<{ avatarUrl: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { success: false, error: 'No file provided' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: 'Only JPG, PNG, WebP, and GIF images are allowed' };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { success: false, error: 'File size must be 5 MB or less' };
  }

  const rawExt = (file.name.split('.').pop() ?? '').toLowerCase();
  const ext = ALLOWED_IMAGE_EXTENSIONS.includes(rawExt) ? rawExt : 'jpg';
  const key = `${session.user.id}/${randomUUID()}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKETS.AVATARS,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: buffer.length,
        ContentDisposition: 'inline',
      }),
    );

    const avatarUrl = `${process.env.MINIO_ENDPOINT}/${BUCKETS.AVATARS}/${key}`;

    await db
      .update(playerProfiles)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(playerProfiles.userId, session.user.id));

    return { success: true, data: { avatarUrl } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return { success: false, error: message };
  }
}
