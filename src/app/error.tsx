'use client';

import { IconAlertTriangle, IconHome, IconRefresh } from '@tabler/icons-react';
import Link from 'next/link';

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-10 text-center animate-fade-in-up">
        <div className="mb-4 inline-flex rounded-xl bg-red-500/10 p-4">
          <IconAlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-bold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-white/50">
          An unexpected error occurred. You can try again or head back home.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-white/40">
            {error.message}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
          >
            <IconRefresh className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="btn-ghost inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
          >
            <IconHome className="h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
