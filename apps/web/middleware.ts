import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. تنظیمات میدلور زبان (next-intl)
const intlMiddleware = createMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  // در صورت تمایل می‌توانید این گزینه را فعال کنید تا fa از آدرس‌های دیفالت حذف شود
  // localePrefix: 'as-needed' 
});

const PUBLIC_PATHS = [
  '/',
  '/courses',
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api',
];

const PROTECTED_PATHS = ['/student', '/watch', '/orders'];
const TEACHER_PATHS = ['/teacher'];

export function middleware(request: NextRequest) {
  // 2. اول میدلور زبان را اجرا می‌کنیم تا ریدایرکت‌های مربوط به زبان انجام شود
  const response = intlMiddleware(request);

  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  // 3. حذف پیشوند زبان (/fa یا /en) موقتاً برای اینکه منطق Auth شما مثل قبل کار کند
  const pathWithoutLocale = pathname.replace(/^\/(fa|en)/, '') || '/';

  const isPublic =
    PUBLIC_PATHS.some((p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/')) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/');

  if (isPublic) {
    return response;
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathWithoutLocale.startsWith(p));
  const isTeacher = TEACHER_PATHS.some((p) => pathWithoutLocale.startsWith(p));

  // 4. بررسی دسترسی‌ها
  if (isProtected || isTeacher) {
    if (!token) {
      // استخراج زبان فعلی از آدرس برای هدایت کاربر به صفحه لاگینِ همان زبان
      const localeMatch = pathname.match(/^\/(fa|en)/);
      const locale = localeMatch ? localeMatch[1] : 'fa';
      
      const url = new URL(`/${locale}/auth/login`, request.url);
      url.searchParams.set('redirect', pathWithoutLocale);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // تنظیمات متچر برای چشم‌پوشی از فایل‌های استاتیک، عکس‌ها و مسیر api
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
