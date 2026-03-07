'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  IconGolf,
  IconChartBar,
  IconUsers,
  IconTrophy,
  IconDeviceGamepad,
  IconTargetArrow,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';

interface Feature {
  icon: TablerIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: IconGolf,
    title: 'Track Every Round',
    description:
      'Log your scores hole by hole with a quick, thumb-friendly scorecard designed for on-course use.',
  },
  {
    icon: IconChartBar,
    title: 'Know Your Game',
    description:
      'See your handicap trend, scoring patterns, and where your game is improving over time.',
  },
  {
    icon: IconUsers,
    title: 'Play With Friends',
    description:
      'Connect with your golf buddies, create matches, and see who takes bragging rights on the leaderboard.',
  },
  {
    icon: IconTrophy,
    title: 'Run Tours & Competitions',
    description:
      'Organize your own tournament series with custom scoring, standings, and season-long rivalries.',
  },
  {
    icon: IconDeviceGamepad,
    title: 'Manage Your Bag',
    description:
      'Keep track of every club — brand, model, and carry distances — so you always know your numbers.',
  },
  {
    icon: IconTargetArrow,
    title: 'Improve Together',
    description:
      'Compare stats with friends, celebrate personal bests, and find the parts of your game to work on.',
  },
];

const motionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
      delay: i * 0.1,
    },
  }),
};

const reducedVariants: Variants = {
  hidden: {},
  visible: {},
};

export function FeaturesGrid() {
  const prefersReduced = useReducedMotion();
  const cardVariants = prefersReduced ? reducedVariants : motionVariants;

  return (
    <section id="features" className="bg-white py-24 px-6" aria-labelledby="features-heading">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-4">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
            Everything You Need on the Course
          </h2>
        </div>
        <p className="text-center text-lg text-gray-600 max-w-xl mx-auto mb-16">
          Built by golfers who understand the game.
        </p>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.article
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:border-golf-light/50 transition-all duration-200"
            >
              <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-golf-green/10">
                <feature.icon className="h-6 w-6 text-golf-green" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
