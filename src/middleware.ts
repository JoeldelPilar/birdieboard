import { auth } from '@/server/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnOnboarding = req.nextUrl.pathname.startsWith('/onboarding');
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', req.nextUrl));
  }

  if (isOnOnboarding && !isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', req.nextUrl));
  }

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl));
  }

  return undefined;
});

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth/:path*'],
};
