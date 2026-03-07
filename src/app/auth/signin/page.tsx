'use client';

import { useState } from 'react';
import { IconBrandGoogle, IconGolf, IconMail, IconArrowRight } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { TextInput } from '@/components/ui/text-input';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleEmailSignIn() {
    if (!email.trim()) return;
    setIsLoading(true);
    await signIn('nodemailer', { email, redirect: false });
    setEmailSent(true);
    setIsLoading(false);
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg animate-fade-in-up">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-xl bg-golf-green/10 p-4">
              <IconMail className="h-10 w-10 text-golf-green" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
            <p className="text-sm leading-relaxed text-gray-600">
              A sign-in link has been sent to{' '}
              <strong className="font-semibold text-gray-900">{email}</strong>. Click the link in
              the email to sign in.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-2 rounded-xl px-5 py-2 text-sm font-medium text-golf-green hover:bg-golf-green/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to track your game</p>
        </div>

        {/* Google */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="group mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
        >
          <IconBrandGoogle className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700" aria-hidden="true" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="mb-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Email magic link */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailSignIn();
          }}
          className="flex flex-col gap-4"
        >
          <TextInput
            label="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onValueChange={setEmail}
            isRequired
            variant="light"
          />
          <button
            type="submit"
            disabled={!email.trim() || isLoading}
            aria-label={isLoading ? 'Sending sign-in link, please wait' : undefined}
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
                <IconMail className="h-5 w-5" aria-hidden="true" />
                Sign in with Email
                <IconArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Legal */}
        <p className="mt-6 text-center text-xs text-gray-500">
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
    </div>
  );
}
