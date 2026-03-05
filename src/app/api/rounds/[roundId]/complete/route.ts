import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { completeRound } from '@/server/actions/rounds';

type RouteContext = { params: Promise<{ roundId: string }> };

// POST /api/rounds/[roundId]/complete — mark a round as completed
export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { roundId } = await context.params;

  const result = await completeRound(roundId);

  if (!result.success) {
    const status =
      result.error === 'Round not found'
        ? 404
        : result.error === 'Round is not in progress'
          ? 409
          : result.error.startsWith('Missing score for hole')
            ? 422
            : result.error === 'Player profile not found'
              ? 404
              : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data);
}
