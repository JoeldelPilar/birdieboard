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
    <div className="glass-card w-full max-w-md rounded-2xl p-8 animate-fade-in-up">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-xl bg-red-500/10 p-4">
          <IconAlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Sign in error</h1>
        <p className="text-sm leading-relaxed text-white/50">{message}</p>
        <Link href="/auth/signin" className="btn-ghost mt-2 rounded-full px-6 py-2 text-sm">
          Try again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-golf-green" />
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
