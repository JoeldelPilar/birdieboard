import { IconMail } from '@tabler/icons-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-xl bg-golf-green/10 p-4">
            <IconMail className="h-10 w-10 text-golf-green" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-sm leading-relaxed text-gray-600">
            A sign-in link has been sent to your email address. Click the link in the email to sign
            in to Birdieboard.
          </p>
          <Link
            href="/auth/signin"
            className="mt-2 rounded-xl px-5 py-2.5 text-sm font-medium text-golf-green hover:bg-golf-green/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
