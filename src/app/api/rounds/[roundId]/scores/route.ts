import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { saveHoleScore } from '@/server/actions/rounds';
import { saveHoleScoreSchema } from '@/lib/validations/round';

type RouteContext = { params: Promise<{ roundId: string }> };

// POST /api/rounds/[roundId]/scores — save (upsert) a hole score
export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { roundId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { statusCode: 400, error: 'Bad Request', message: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const parsed = saveHoleScoreSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input';
    return NextResponse.json({ statusCode: 400, error: 'Bad Request', message }, { status: 400 });
  }

  const result = await saveHoleScore(roundId, parsed.data);

  if (!result.success) {
    const status =
      result.error === 'Round not found'
        ? 404
        : result.error === 'Round is not in progress'
          ? 409
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
