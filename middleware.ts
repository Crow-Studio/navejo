// middleware.ts (with debugging)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/bookmarks', '/settings', '/profile'];
const authRoutes = ['/auth/sign-in'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session')?.value;
  
  // Debug logging
  console.log('Middleware Debug:', {
    pathname,
    hasSession: !!sessionToken,
    sessionToken: sessionToken ? `${sessionToken.slice(0, 10)}...` : 'none',
    cookies: request.cookies.getAll().reduce((acc, cookie) => ({ ...acc, [cookie.name]: cookie.value }), {})
  });
  
  // Check if user is trying to access a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if user is trying to access an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  console.log('Route Check:', {
    isProtectedRoute,
    isAuthRoute,
    action: isProtectedRoute && !sessionToken ? 'redirect to login' : 
            isAuthRoute && sessionToken ? 'redirect to dashboard' : 'continue'
  });

  // If trying to access protected route without session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/auth/sign-in', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    console.log('Redirecting to login:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth routes with session, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    const dashboardUrl = new URL('/dashboard', request.url);
    console.log('Redirecting to dashboard:', dashboardUrl.toString());
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};