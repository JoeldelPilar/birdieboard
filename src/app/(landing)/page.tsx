import { Button, Link } from '@heroui/react';
import {
  IconGolf,
  IconChartBar,
  IconUsers,
  IconTrophy,
  IconDeviceGamepad,
  IconTargetArrow,
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
    <div className="min-h-screen bg-gradient-to-b from-background to-golf-green/10">
      {/* Hero */}
      <header className="container mx-auto px-6 pt-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconGolf className="h-8 w-8 text-golf-green" />
            <span className="text-2xl font-bold">Birdieboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Button as={Link} href="/auth/signin" variant="ghost" size="sm">
              Sign In
            </Button>
            <Button as={Link} href="/auth/signin" color="success" size="sm">
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-24 text-center">
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
            Your Golf Game,{' '}
            <span className="bg-gradient-to-r from-golf-green to-golf-fairway bg-clip-text text-transparent">
              Elevated
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-default-500">
            Track rounds, manage your bag, compete with friends, and watch your handicap drop. The
            modern way to play golf.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              as={Link}
              href="/auth/signin"
              color="success"
              size="lg"
              className="font-semibold"
            >
              Start Tracking Free
            </Button>
            <Button as={Link} href="#features" variant="bordered" size="lg">
              See Features
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-6 py-24">
          <h2 className="mb-16 text-center text-3xl font-bold">
            Everything You Need on the Course
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-default-200 bg-content1 p-8 transition-all hover:border-golf-green/50 hover:shadow-lg"
              >
                <feature.icon className="mb-4 h-10 w-10 text-golf-green" />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-default-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-24 text-center">
          <div className="rounded-3xl bg-gradient-to-r from-golf-green to-golf-fairway p-16">
            <h2 className="mb-4 text-3xl font-bold text-white">Ready to Improve Your Game?</h2>
            <p className="mb-8 text-lg text-white/80">
              Join Birdieboard today and start tracking your journey to a lower handicap.
            </p>
            <Button
              as={Link}
              href="/auth/signin"
              size="lg"
              className="bg-white font-semibold text-golf-green"
            >
              Get Started &mdash; It&apos;s Free
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto border-t border-default-200 px-6 py-8">
        <div className="flex items-center justify-between text-sm text-default-400">
          <div className="flex items-center gap-2">
            <IconGolf className="h-5 w-5" />
            <span>Birdieboard</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Birdieboard. Built with Open Source Cloud.</p>
        </div>
      </footer>
    </div>
  );
}
