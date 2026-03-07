'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface Testimonial {
  quote: string;
  name: string;
  initials: string;
  handicap: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Finally an app that makes it easy to log rounds right on the course. I used to forget my scores by the time I got home — now it takes seconds per hole.',
    name: 'Marcus Lindqvist',
    initials: 'ML',
    handicap: '14.2',
  },
  {
    quote:
      'The friend competitions are what keep me coming back. My Saturday group has a season-long rivalry going and the leaderboard makes every round count.',
    name: 'Sarah Chen',
    initials: 'SC',
    handicap: '8.1',
  },
  {
    quote:
      "I never tracked my stats before Birdieboard. Seeing my handicap drop from 28 to 22 over six months gave me motivation I didn't know I needed.",
    name: 'David Ekström',
    initials: 'DE',
    handicap: '22.5',
  },
  {
    quote:
      'Simple, clean, and built for golfers — not tech people. I recommended it to everyone in my club and now we all track together.',
    name: 'Anna Johansson',
    initials: 'AJ',
    handicap: '18.4',
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

export function Testimonials() {
  return (
    <section
      className="bg-gray-50 py-24 px-6 border-y border-gray-100"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          id="testimonials-heading"
          className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16"
        >
          What Golfers Are Saying
        </h2>

        {/* 3-column on desktop, 2-column on tablet, 1-column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial, i) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
          ))}
          {/* 4th testimonial: visible on mobile and tablet, hidden on lg */}
          <div className="lg:hidden">
            <TestimonialCard testimonial={testimonials[3]} index={3} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const prefersReduced = useReducedMotion();
  const cardVariants = prefersReduced ? reducedVariants : motionVariants;

  return (
    <motion.figure
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow duration-200"
    >
      <blockquote className="text-gray-700 text-base leading-relaxed mb-6 italic flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <figcaption className="flex items-center gap-3 mt-auto">
        {/* Initials avatar */}
        <div
          className="w-10 h-10 rounded-full bg-golf-green/20 flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-golf-green font-semibold text-sm">{testimonial.initials}</span>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-500">{testimonial.handicap} HCP</p>
        </div>
      </figcaption>
    </motion.figure>
  );
}
