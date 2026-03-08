'use client';

import { useState } from 'react';
import {
  IconBrandGoogle,
  IconGolf,
  IconArrowRight,
  IconLock,
  IconMail,
  IconUser,
} from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { TextInput } from '@/components/ui/text-input';
import { signUp } from '@/server/actions/auth';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await signUp({ name: name.trim(), email: email.trim(), password });

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // Account created — sign in automatically
    const signInResult = await signIn('credentials', {
      email: email.trim(),
      password,
      redirect: false,
      callbackUrl: '/onboarding',
    });

    if (signInResult?.error) {
      setError('Account created but sign-in failed. Please sign in manually.');
      setIsLoading(false);
      return;
    }

    window.location.href = signInResult?.url ?? '/onboarding';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500">Start tracking your golf game today</p>
        </div>

        {/* Google */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
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

        {/* Sign up form */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <TextInput
            label="Name"
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onValueChange={setName}
            isRequired
            autoFocus
            variant="light"
            description="Min 2 characters"
            startContent={<IconUser className="h-4 w-4 text-gray-400" aria-hidden="true" />}
          />
          <TextInput
            label="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onValueChange={setEmail}
            isRequired
            variant="light"
            startContent={<IconMail className="h-4 w-4 text-gray-400" aria-hidden="true" />}
          />
          <TextInput
            label="Password"
            id="password"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onValueChange={setPassword}
            isRequired
            variant="light"
            description="At least 8 characters"
            startContent={<IconLock className="h-4 w-4 text-gray-400" aria-hidden="true" />}
          />
          <button
            type="submit"
            disabled={!name.trim() || !email.trim() || !password.trim() || isLoading}
            aria-label={isLoading ? 'Creating account, please wait' : undefined}
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
                Create account
                <IconArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="font-semibold text-golf-green hover:text-golf-fairway underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-1 rounded"
          >
            Sign in
          </Link>
        </p>

        {/* Legal */}
        <p className="mt-4 text-center text-xs text-gray-500">
          By creating an account, you agree to our{' '}
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
    </div>
  );
}
