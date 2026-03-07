import Link from 'next/link';
import { IconGolf } from '@tabler/icons-react';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
] as const;

export function LandingFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top row: logo + nav links */}
        <div className="py-12 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Logo + tagline */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2 rounded-md"
              aria-label="Birdieboard home"
            >
              <IconGolf className="h-6 w-6 text-golf-green" aria-hidden="true" />
              <span className="text-lg font-bold text-gray-900">Birdieboard</span>
            </Link>
            <p className="mt-2 text-sm text-gray-500">Track, play, improve.</p>
          </div>

          {/* Footer links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-golf-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golf-green focus-visible:ring-offset-2 rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Bottom row: copyright */}
        <div className="py-6 text-center md:text-left">
          <p className="text-sm text-gray-500">
            &copy; 2026 Birdieboard. Built with Open Source Cloud.
          </p>
        </div>
      </div>
    </footer>
  );
}
