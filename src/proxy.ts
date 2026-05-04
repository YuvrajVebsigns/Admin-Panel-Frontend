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

// Helper to decode JWT without a library (only for payload)
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get('access_token')?.value || request.cookies.get('auth_token')?.value;

  // Skip middleware for public assets and api routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(.*)$/)) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (!token && !isPublicPath) {
    // Redirect unauthenticated users to /login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublicPath) {
    // Redirect authenticated users away from auth pages to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Permission-based routing
  if (token && pathname.startsWith('/admin')) {
    const payload = decodeJwt(token);
    const permissions = payload?.permissions || [];
    const isSuperAdmin = permissions.includes('*');

    // Granular protection
    if (!isSuperAdmin) {
      if (
        pathname.startsWith('/admin/sidebar-menu') &&
        !permissions.includes('sidebar-menu.view')
      ) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (pathname.startsWith('/admin/roles') && !permissions.includes('roles.view')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (pathname.startsWith('/admin/users') && !permissions.includes('users.view')) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
