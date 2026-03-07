import Link from 'next/link';
import { IconArrowRight, IconChevronDown } from '@tabler/icons-react';

export function LandingHero() {
  return (
    <section className="bg-white pt-32 pb-20 px-6" aria-labelledby="hero-heading">
      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight"
        >
          Track Your Game.
          <br />
          Share Your Journey.
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          The golf community where you track rounds, compare stats with friends, and watch your
          handicap drop &mdash; all in one place.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-golf-green text-white text-base font-semibold px-8 py-3.5 rounded-xl hover:bg-golf-fairway shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
          >
            Start Tracking Free
            <IconArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>

          <a
            href="#features"
            className="hidden sm:inline-flex items-center gap-2 text-golf-green font-semibold px-6 py-3.5 rounded-xl border-2 border-golf-green/20 hover:border-golf-green/40 hover:bg-golf-green/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
          >
            See Features
            <IconChevronDown className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>

        {/* Hero image placeholder */}
        <div className="mt-16 max-w-3xl mx-auto rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div
            className="aspect-video bg-golf-green/5 flex flex-col items-center justify-center gap-3"
            aria-label="Birdieboard app screenshot placeholder"
            role="img"
          >
            <div className="w-16 h-16 rounded-2xl bg-golf-green/20 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-golf-green"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">App Screenshot Coming Soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
