import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route requires protection
  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');

  if (isDashboard || isAdmin) {
    // Get session cookie
    const sessionCookie = request.cookies.get('ndps-session');

    if (!sessionCookie || !sessionCookie.value) {
      // No session found - redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      const partner = await verifyToken(sessionCookie.value);

      if (!partner) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Check admin routes
      if (isAdmin && (!partner.isAdmin || !partner.approved)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Continue to the route
      return NextResponse.next();
    } catch (error) {
      // Token verification failed
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
