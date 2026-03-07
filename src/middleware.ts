import NextAuth from 'next-auth';
import { authConfig } from '@/server/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const hasProfile = req.auth?.user?.hasProfile === true;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnOnboarding = req.nextUrl.pathname.startsWith('/onboarding');
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

  // Unauthenticated users must sign in first
  if ((isOnDashboard || isOnOnboarding) && !isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', req.nextUrl));
  }

  // Logged-in users without a profile must complete onboarding
  if (isLoggedIn && !hasProfile && isOnDashboard) {
    return Response.redirect(new URL('/onboarding', req.nextUrl));
  }

  // Logged-in users who already have a profile skip onboarding
  if (isLoggedIn && hasProfile && isOnOnboarding) {
    return Response.redirect(new URL('/dashboard', req.nextUrl));
  }

  // Logged-in users are sent away from auth pages
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl));
  }

  return undefined;
});

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth/:path*'],
};
