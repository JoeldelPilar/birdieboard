'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { signUpSchema } from '@/lib/validations/auth';
import type { SignUpInput } from '@/lib/validations/auth';
import type { ActionResponse } from '@/types';

export async function signUp(data: SignUpInput): Promise<ActionResponse<{ userId: string }>> {
  const validated = signUpSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { name, email, password } = validated.data;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const hashedPassword = await hash(password, 12);

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id });

    if (!created) {
      return { success: false, error: 'Failed to create account' };
    }

    return { success: true, data: { userId: created.id } };
  } catch (err) {
    console.error('[signUp] Unexpected error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
