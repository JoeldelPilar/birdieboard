'use client';

import { Suspense } from 'react';
import { Card, CardBody, Button, Spinner } from '@heroui/react';
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
    <Card className="w-full max-w-md">
      <CardBody className="flex flex-col items-center gap-4 px-8 py-12">
        <IconAlertTriangle className="h-12 w-12 text-danger" />
        <h1 className="text-2xl font-bold">Sign in error</h1>
        <p className="text-center text-sm text-default-500">{message}</p>
        <Button as={Link} href="/auth/signin" variant="bordered" className="mt-2">
          Try again
        </Button>
      </CardBody>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-golf-green/5 p-4">
      <Suspense fallback={<Spinner size="lg" />}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
