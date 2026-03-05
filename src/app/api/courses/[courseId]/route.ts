import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { getCourseDetails } from '@/server/actions/courses';

type RouteContext = { params: Promise<{ courseId: string }> };

// GET /api/courses/[courseId] — get course details with tees and holes
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { courseId } = await context.params;

  const result = await getCourseDetails(courseId);

  if (!result.success) {
    const status = result.error === 'Course not found' ? 404 : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data);
}
