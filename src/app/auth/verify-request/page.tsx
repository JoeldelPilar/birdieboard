import { IconMail } from '@tabler/icons-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-xl bg-golf-green/10 p-4">
            <IconMail className="h-10 w-10 text-golf-green icon-glow" />
          </div>
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-sm leading-relaxed text-white/50">
            A sign-in link has been sent to your email address. Click the link in the email to sign
            in to Birdieboard.
          </p>
          <Link href="/auth/signin" className="btn-ghost mt-2 rounded-full px-6 py-2 text-sm">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
