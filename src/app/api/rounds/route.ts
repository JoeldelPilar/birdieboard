import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { getMyRounds, startRound } from '@/server/actions/rounds';
import { startRoundSchema } from '@/lib/validations/round';

// GET /api/rounds?limit=...&offset=... — list rounds for current player
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;
  const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return NextResponse.json(
      {
        statusCode: 400,
        error: 'Bad Request',
        message: 'limit must be an integer between 1 and 100',
      },
      { status: 400 },
    );
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return NextResponse.json(
      { statusCode: 400, error: 'Bad Request', message: 'offset must be a non-negative integer' },
      { status: 400 },
    );
  }

  const result = await getMyRounds(limit, offset);

  if (!result.success) {
    const status = result.error === 'Player profile not found' ? 404 : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data);
}

// POST /api/rounds — start a new round
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { statusCode: 400, error: 'Bad Request', message: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const parsed = startRoundSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input';
    return NextResponse.json({ statusCode: 400, error: 'Bad Request', message }, { status: 400 });
  }

  const result = await startRound(parsed.data);

  if (!result.success) {
    const status =
      result.error === 'Course not found' || result.error === 'Tee not found for this course'
        ? 404
        : result.error === 'Player profile not found'
          ? 404
          : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
