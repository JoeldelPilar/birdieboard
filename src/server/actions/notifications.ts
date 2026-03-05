'use server';

import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import { notifications } from '@/lib/drizzle/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import type { ActionResponse } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'match_invite'
  | 'match_started'
  | 'match_completed'
  | 'friend_request'
  | 'friend_accepted'
  | 'tour_invite'
  | 'system';

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  referenceId: string | null;
  referenceType: string | null;
};

// ---------------------------------------------------------------------------
// getNotifications — get notifications for the current user, newest first
// ---------------------------------------------------------------------------

export async function getNotifications(limit = 50): Promise<ActionResponse<Notification[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        referenceId: notifications.referenceId,
        referenceType: notifications.referenceType,
      })
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    const result: Notification[] = rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.isRead,
      createdAt: row.createdAt.toISOString(),
      referenceId: row.referenceId,
      referenceType: row.referenceType,
    }));

    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// markNotificationRead — mark a single notification as read
// ---------------------------------------------------------------------------

export async function markNotificationRead(notificationId: string): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.user.id)))
      .returning({ id: notifications.id });

    if (result.length === 0) {
      return { success: false, error: 'Notification not found' };
    }

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// markAllRead — mark all unread notifications as read for current user
// ---------------------------------------------------------------------------

export async function markAllRead(): Promise<ActionResponse<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));

    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// getUnreadCount — count of unread notifications for current user
// ---------------------------------------------------------------------------

export async function getUnreadCount(): Promise<ActionResponse<number>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const result = await db
      .select({ total: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));

    const total = result[0]?.total ?? 0;

    return { success: true, data: total };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
