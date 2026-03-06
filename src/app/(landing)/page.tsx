'use client';

import Link from 'next/link';
import {
  IconGolf,
  IconChartBar,
  IconUsers,
  IconTrophy,
  IconDeviceGamepad,
  IconTargetArrow,
  IconArrowRight,
  IconChevronDown,
} from '@tabler/icons-react';

const features = [
  {
    icon: IconGolf,
    title: 'Track Every Round',
    description: 'Log scores hole by hole with an intuitive mobile-first scorecard.',
  },
  {
    icon: IconChartBar,
    title: 'Know Your Game',
    description: 'Automatic handicap calculation and detailed statistics to find your strengths.',
  },
  {
    icon: IconUsers,
    title: 'Play With Friends',
    description: 'Create matches, invite friends, and compete on live leaderboards.',
  },
  {
    icon: IconTrophy,
    title: 'Run Tours',
    description: 'Organize tournament series with custom scoring and cumulative standings.',
  },
  {
    icon: IconDeviceGamepad,
    title: 'Manage Your Bag',
    description: 'Track every club in your bag with brand, model, and carry distances.',
  },
  {
    icon: IconTargetArrow,
    title: 'Improve Your Game',
    description: 'Strokes gained analysis, practice logs, and AI-powered club recommendations.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050a05]">
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 z-50 w-full">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2">
            <IconGolf className="h-6 w-6 text-golf-green icon-glow" />
            <span className="text-lg font-bold text-white">Birdieboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="btn-ghost rounded-full px-5 py-2 text-sm">
              Sign In
            </Link>
            <Link href="/auth/signin" className="btn-primary rounded-full px-5 py-2 text-sm">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ─── Hero Section ─── */}
        <section className="aurora-bg flex min-h-screen flex-col items-center justify-center px-6 text-center">
          {/* Community badge */}
          <div className="glass-card mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 animate-fade-in-up">
            <span className="h-2 w-2 rounded-full bg-golf-green pulse-dot" />
            <span className="text-sm text-golf-light">Join the community of golfers</span>
          </div>

          <h1
            className="mb-6 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Your Golf Game,
            <br />
            <span className="text-glow">Elevated</span>
          </h1>

          <p
            className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Track rounds, manage your bag, compete with friends, and watch your handicap drop. The
            modern way to play golf.
          </p>

          <div
            className="flex flex-col items-center gap-4 sm:flex-row animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link href="/auth/signin" className="btn-primary btn-primary-lg group">
              Start Tracking Free
              <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#features" className="btn-ghost btn-ghost-lg">
              See Features
              <IconChevronDown className="h-5 w-5" />
            </a>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 animate-bounce text-white/20">
            <IconChevronDown className="h-6 w-6" />
          </div>
        </section>

        {/* ─── Features Grid ─── */}
        <section id="features" className="relative px-6 py-32">
          {/* Subtle glow behind section */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-64 w-[600px] rounded-full bg-golf-green/8 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
                Everything You Need
                <br />
                <span className="text-glow">on the Course</span>
              </h2>
              <p className="mx-auto max-w-lg text-white/50">
                Built by golfers, for golfers. Every feature designed to help you play better.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="glass-card glass-card-hover group rounded-2xl p-8 animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="mb-5 inline-flex rounded-xl bg-golf-green/10 p-3">
                    <feature.icon className="h-7 w-7 text-golf-green transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section className="relative px-6 py-32">
          <div className="mx-auto max-w-4xl">
            <div className="glass-card gradient-border overflow-hidden rounded-3xl p-12 text-center md:p-20">
              {/* Background glow */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-golf-green/15 blur-[100px]" />
                <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-golf-sky/10 blur-[100px]" />
              </div>

              <div className="relative">
                <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
                  Ready to Improve
                  <br />
                  <span className="text-glow">Your Game?</span>
                </h2>
                <p className="mx-auto mb-10 max-w-lg text-lg text-white/50">
                  Join Birdieboard today and start tracking your journey to a lower handicap.
                </p>
                <Link href="/auth/signin" className="btn-primary btn-primary-lg group">
                  Get Started &mdash; It&apos;s Free
                  <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-white/30">
          <div className="flex items-center gap-2">
            <IconGolf className="h-5 w-5" />
            <span className="font-medium">Birdieboard</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Birdieboard. Built with Open Source Cloud.</p>
        </div>
      </footer>
    </div>
  );
}
