'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconGolf } from '@tabler/icons-react';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      role="banner"
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2 rounded-md"
          aria-label="Birdieboard home"
        >
          <IconGolf className="h-7 w-7 text-golf-green" aria-hidden="true" />
          <span className="text-xl font-bold text-gray-900">Birdieboard</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="hidden md:inline-flex text-sm font-medium text-gray-600 hover:text-golf-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2 rounded-md px-2 py-1"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 bg-golf-green text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-golf-fairway transition-colors shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
