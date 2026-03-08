'use client';

import { Suspense, useState } from 'react';
import { IconBrandGoogle, IconGolf, IconArrowRight, IconLock, IconMail } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TextInput } from '@/components/ui/text-input';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === 'CredentialsSignin' ? 'Invalid email or password' : null,
  );

  async function handleCredentialsSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
      return;
    }

    // Successful sign-in — redirect
    window.location.href = result?.url ?? callbackUrl;
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
          aria-label="Birdieboard home"
        >
          <div className="rounded-xl bg-golf-green/10 p-3 transition-transform group-hover:scale-105">
            <IconGolf className="h-8 w-8 text-golf-green" aria-hidden="true" />
          </div>
        </Link>
        <span className="text-xl font-bold text-gray-900">Birdieboard</span>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to track your game</p>
      </div>

      {/* Google */}
      <button
        onClick={() => signIn('google', { callbackUrl })}
        className="group mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
      >
        <IconBrandGoogle
          className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700"
          aria-hidden="true"
        />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {/* Email + Password */}
      <form onSubmit={handleCredentialsSignIn} className="flex flex-col gap-4">
        <TextInput
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onValueChange={setEmail}
          isRequired
          autoFocus
          variant="light"
          startContent={<IconMail className="h-4 w-4 text-gray-400" aria-hidden="true" />}
        />
        <TextInput
          label="Password"
          id="password"
          type="password"
          placeholder="Your password"
          value={password}
          onValueChange={setPassword}
          isRequired
          variant="light"
          startContent={<IconLock className="h-4 w-4 text-gray-400" aria-hidden="true" />}
        />
        <button
          type="submit"
          disabled={!email.trim() || !password.trim() || isLoading}
          aria-label={isLoading ? 'Signing in, please wait' : undefined}
          aria-busy={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-golf-green px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-golf-fairway hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden="true"
            />
          ) : (
            <>
              Sign in
              <IconArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-semibold text-golf-green hover:text-golf-fairway underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-1 rounded"
        >
          Create one
        </Link>
      </p>

      {/* Legal */}
      <p className="mt-4 text-center text-xs text-gray-500">
        By signing in, you agree to our{' '}
        <Link
          href="#"
          className="text-golf-green hover:text-golf-fairway underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-1 rounded"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="#"
          className="text-golf-green hover:text-golf-fairway underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-1 rounded"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
