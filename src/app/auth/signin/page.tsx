'use client';

import { useState } from 'react';
import { Input } from '@heroui/react';
import { IconBrandGoogle, IconGolf, IconMail, IconArrowRight } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

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
      <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
        <div className="glass-card w-full max-w-md rounded-2xl p-8 animate-fade-in-up">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-xl bg-golf-green/10 p-4">
              <IconMail className="h-10 w-10 text-golf-green icon-glow" />
            </div>
            <h1 className="text-2xl font-bold text-white">Check your email</h1>
            <p className="text-sm leading-relaxed text-white/50">
              A sign-in link has been sent to <strong className="text-white/80">{email}</strong>.
              Click the link in the email to sign in.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="btn-ghost mt-2 rounded-full px-5 py-2 text-sm"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 animate-fade-in-up">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="group">
            <div className="rounded-xl bg-golf-green/10 p-3 transition-transform group-hover:scale-105">
              <IconGolf className="h-8 w-8 text-golf-green icon-glow" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome to Birdieboard</h1>
          <p className="text-sm text-white/40">Sign in to track your game</p>
        </div>

        {/* Google */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="group mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition-all hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
        >
          <IconBrandGoogle className="h-5 w-5 text-white/70 transition-colors group-hover:text-white" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="mb-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium text-white/25">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Email magic link */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailSignIn();
          }}
          className="flex flex-col gap-4"
        >
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onValueChange={setEmail}
            variant="bordered"
            labelPlacement="outside"
            isRequired
          />
          <button
            type="submit"
            disabled={!email.trim() || isLoading}
            className="btn-primary w-full rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <IconMail className="h-5 w-5" />
                Sign in with Email
                <IconArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Legal */}
        <p className="mt-6 text-center text-xs text-white/25">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
