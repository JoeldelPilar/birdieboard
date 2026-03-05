'use client';

import { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Divider, Input } from '@heroui/react';
import { IconBrandGoogle, IconGolf, IconMail } from '@tabler/icons-react';
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-golf-green/5 p-4">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 px-8 py-12">
            <IconMail className="h-12 w-12 text-golf-green" />
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-center text-sm text-default-500">
              A sign-in link has been sent to <strong>{email}</strong>. Click the link in the email
              to sign in.
            </p>
            <Button variant="light" size="sm" onPress={() => setEmailSent(false)} className="mt-2">
              Use a different email
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-golf-green/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2 pb-0 pt-8">
          <Link href="/" className="flex items-center gap-2">
            <IconGolf className="h-10 w-10 text-golf-green" />
          </Link>
          <h1 className="text-2xl font-bold">Welcome to Birdieboard</h1>
          <p className="text-sm text-default-500">Sign in to track your game</p>
        </CardHeader>
        <CardBody className="gap-4 px-8 pb-8 pt-6">
          <Button
            onPress={() => signIn('google', { callbackUrl: '/dashboard' })}
            variant="bordered"
            size="lg"
            startContent={<IconBrandGoogle className="h-5 w-5" />}
            className="w-full"
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <Divider className="flex-1" />
            <span className="text-xs text-default-400">OR</span>
            <Divider className="flex-1" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailSignIn();
            }}
            className="flex flex-col gap-3"
          >
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onValueChange={setEmail}
              variant="bordered"
              isRequired
            />
            <Button
              type="submit"
              variant="flat"
              size="lg"
              startContent={<IconMail className="h-5 w-5" />}
              className="w-full"
              isLoading={isLoading}
              isDisabled={!email.trim()}
            >
              Sign in with Email
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-default-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
