'use client';

import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { IconBrandGoogle, IconGolf, IconMail } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignInPage() {
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

          <Button
            variant="flat"
            size="lg"
            startContent={<IconMail className="h-5 w-5" />}
            className="w-full"
            isDisabled
          >
            Sign in with Email (coming soon)
          </Button>

          <p className="mt-4 text-center text-xs text-default-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
