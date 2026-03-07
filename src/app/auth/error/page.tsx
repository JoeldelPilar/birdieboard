'use client';

import { Suspense } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The sign-in link has expired or has already been used.',
  Default: 'An error occurred during sign in. Please try again.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') ?? 'Default';
  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg animate-fade-in-up">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-xl bg-red-50 p-4">
          <IconAlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sign in error</h1>
        <p className="text-sm leading-relaxed text-gray-600">{message}</p>
        <Link
          href="/auth/signin"
          className="mt-2 inline-flex items-center rounded-xl bg-golf-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-golf-fairway hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-golf-green" />
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
