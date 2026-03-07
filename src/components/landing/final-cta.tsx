import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';

export function FinalCta() {
  return (
    <section className="py-24 px-6" aria-labelledby="final-cta-heading">
      <div className="max-w-4xl mx-auto">
        <div className="bg-golf-green rounded-2xl md:rounded-3xl px-8 md:px-16 py-16 md:py-20 text-center">
          <h2
            id="final-cta-heading"
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to Join the Fairway?
          </h2>

          <p className="text-lg text-white max-w-lg mx-auto mb-10">
            Start tracking your rounds and connect with golfers who share your passion for the game.
          </p>

          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-white text-golf-green text-base font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-golf-green"
          >
            Get Started &mdash; It&apos;s Free
            <IconArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
