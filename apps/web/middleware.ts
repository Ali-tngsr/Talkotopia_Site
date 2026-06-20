import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require auth
const PUBLIC_PATHS = [
  '/',
  '/courses',
  '/courses/',
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api',
];

// Paths that require auth
const PROTECTED_PATHS = ['/student', '/watch', '/orders'];

// Teacher-only paths
const TEACHER_PATHS = ['/teacher'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  // Check if path is public
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/');

  // Allow public paths
  if (isPublic) {
    return NextResponse.next();
  }

  // Check if path is protected
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isTeacher = TEACHER_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected || isTeacher) {
    // Client-side auth check via token cookie
    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
