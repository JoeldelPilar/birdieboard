import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set Up Your Profile — Birdieboard',
  description: 'Create your Birdieboard golfer profile to get started.',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-golf-green via-golf-fairway to-golf-green/80 px-4 py-12">
      {children}
    </div>
  );
}
