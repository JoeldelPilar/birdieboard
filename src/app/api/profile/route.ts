import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { getProfile, updateProfile } from '@/server/actions/profile';
import { updateProfileSchema } from '@/lib/validations/profile';

// GET /api/profile — get current user's profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const result = await getProfile();

  if (!result.success) {
    const status = result.error === 'Profile not found' ? 404 : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data);
}

// PUT /api/profile — update current user's profile
export async function PUT(request: Request) {
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

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input';
    return NextResponse.json({ statusCode: 400, error: 'Bad Request', message }, { status: 400 });
  }

  const result = await updateProfile(parsed.data);

  if (!result.success) {
    const status = result.error === 'Profile not found' ? 404 : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data);
}
