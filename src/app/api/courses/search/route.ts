import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { searchCourses } from '@/server/actions/courses';
import { searchCoursesSchema } from '@/lib/validations/round';

// GET /api/courses/search?query=...&country=...&limit=...
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const rawInput = {
    query: searchParams.get('query') ?? '',
    country: searchParams.get('country') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
  };

  const parsed = searchCoursesSchema.safeParse(rawInput);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input';
    return NextResponse.json({ statusCode: 400, error: 'Bad Request', message }, { status: 400 });
  }

  const result = await searchCourses(parsed.data.query, parsed.data.country, parsed.data.limit);

  if (!result.success) {
    return NextResponse.json(
      { statusCode: 500, error: 'Internal Server Error', message: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json(result.data);
}
