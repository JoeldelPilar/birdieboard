import { Card, CardBody } from '@heroui/react';
import { IconMail } from '@tabler/icons-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-golf-green/5 p-4">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-4 px-8 py-12">
          <IconMail className="h-12 w-12 text-golf-green" />
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-center text-sm text-default-500">
            A sign-in link has been sent to your email address. Click the link in the email to sign
            in to Birdieboard.
          </p>
          <Link href="/auth/signin" className="mt-2 text-sm text-golf-green hover:underline">
            Back to sign in
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
