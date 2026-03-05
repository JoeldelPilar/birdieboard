import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { uploadAvatar } from '@/server/actions/profile';

// POST /api/profile/avatar — upload avatar image
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { statusCode: 401, error: 'Unauthorized', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { statusCode: 400, error: 'Bad Request', message: 'Invalid multipart form data' },
      { status: 400 },
    );
  }

  const result = await uploadAvatar(formData);

  if (!result.success) {
    const status =
      result.error === 'No file provided' ||
      result.error === 'File must be an image' ||
      result.error === 'File size must be 5 MB or less'
        ? 400
        : 500;
    return NextResponse.json(
      { statusCode: status, error: result.error, message: result.error },
      { status },
    );
  }

  return NextResponse.json(result.data, { status: 201 });
}
