import { IconGolf, IconHome } from '@tabler/icons-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-lg animate-fade-in-up">
        <div className="mb-4 inline-flex rounded-xl bg-golf-green/10 p-4">
          <IconGolf className="h-8 w-8 text-golf-green opacity-60" aria-hidden="true" />
        </div>
        <p className="text-6xl font-extrabold text-golf-green">404</p>
        <h1 className="mt-3 text-xl font-bold text-gray-900">Lost on the course?</h1>
        <p className="mt-2 text-sm text-gray-500">
          This hole does not exist. Let&apos;s get you back to the clubhouse.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-golf-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-golf-fairway hover:shadow-md active:scale-[0.98]"
        >
          <IconHome className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
