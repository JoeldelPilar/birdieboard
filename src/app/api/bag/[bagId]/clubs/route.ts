import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { addClub } from '@/server/actions/bag';
import { createClubSchema } from '@/lib/validations/bag';
import { db } from '@/lib/db';
import { golfBags, clubs, playerProfiles } from '@/lib/drizzle/schema';
import { eq, and, asc } from 'drizzle-orm';

type RouteContext = { params: Promise<{ bagId: string }> };

// GET /api/bag/[bagId]/clubs — list clubs for a specific bag
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { bagId } = await context.params;

  try {
    // Verify ownership via player profile join
    const profileResult = await db
      .select({ id: playerProfiles.id })
      .from(playerProfiles)
      .where(eq(playerProfiles.userId, session.user.id))
      .limit(1);

    const playerId = profileResult[0]?.id;
    if (!playerId) {
      return NextResponse.json(
        { statusCode: 404, error: 'Not Found', message: 'Player profile not found' },
        { status: 404 },
      );
    }

    const bagResult = await db
      .select()
      .from(golfBags)
      .where(and(eq(golfBags.id, bagId), eq(golfBags.playerId, playerId)))
      .limit(1);

    if (!bagResult[0]) {
      return NextResponse.json(
        { statusCode: 404, error: 'Not Found', message: 'Bag not found' },
        { status: 404 },
      );
    }

    const clubRows = await db
      .select()
      .from(clubs)
      .where(eq(clubs.bagId, bagId))
      .orderBy(asc(clubs.sortOrder));

    return NextResponse.json(clubRows);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { statusCode: 500, error: 'Internal Server Error', message },
      { status: 500 },
    );
  }
}

// POST /api/bag/[bagId]/clubs — add a club to a bag
export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { bagId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { statusCode: 400, error: 'Bad Request', message: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const parsed = createClubSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input';
    return NextResponse.json({ statusCode: 400, error: 'Bad Request', message }, { status: 400 });
  }

  const result = await addClub(bagId, parsed.data);

  if (!result.success) {
    const status = result.error === 'Bag not found' ? 404 : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
