import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingHero } from '@/components/landing/landing-hero';
import { SocialProofBar } from '@/components/landing/social-proof-bar';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { Testimonials } from '@/components/landing/testimonials';
import { FinalCta } from '@/components/landing/final-cta';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-golf-green focus:font-semibold focus:ring-2 focus:ring-golf-green focus:outline-none"
      >
        Skip to main content
      </a>

      <LandingNavbar />

      <main id="main-content">
        <LandingHero />
        <SocialProofBar />
        <FeaturesGrid />
        <Testimonials />
        <FinalCta />
      </main>

      <LandingFooter />
    </div>
  );
}
