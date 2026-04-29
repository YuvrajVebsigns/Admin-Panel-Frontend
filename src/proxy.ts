import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// All public (unauthenticated) paths
const publicPaths = [
  '/login',
  '/signup',
  '/forgetpassword',
  '/auth',
  '/verify-otp',
  '/reset-password',
  '/test-connection',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasToken = request.cookies.has('auth_token') || request.cookies.has('access_token');

  // Skip middleware for public assets and api routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(.*)$/)) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (!hasToken && !isPublicPath) {
    // Redirect unauthenticated users to /login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasToken && isPublicPath) {
    // Redirect authenticated users away from auth pages to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
