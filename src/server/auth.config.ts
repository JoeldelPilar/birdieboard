import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth config (no Node.js-only providers).
 * Used by middleware for route protection. The full config in auth.ts
 * extends this with Credentials + adapter for server-side usage.
 */
export const authConfig = {
  session: {
    strategy: 'jwt' as const,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) return isLoggedIn;

      return true;
    },
  },
} satisfies NextAuthConfig;
