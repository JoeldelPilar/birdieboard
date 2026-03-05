import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { getRound, deleteRound } from '@/server/actions/rounds';

type RouteContext = { params: Promise<{ roundId: string }> };

// GET /api/rounds/[roundId] — get round details with hole scores
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { roundId } = await context.params;

  const result = await getRound(roundId);

  if (!result.success) {
    const status = result.error === 'Round not found' ? 404 : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data);
}

// DELETE /api/rounds/[roundId] — delete an in_progress round
export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { roundId } = await context.params;

  const result = await deleteRound(roundId);

  if (!result.success) {
    const status =
      result.error === 'Round not found'
        ? 404
        : result.error === 'Only in-progress rounds can be deleted'
          ? 409
          : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return new NextResponse(null, { status: 204 });
}
