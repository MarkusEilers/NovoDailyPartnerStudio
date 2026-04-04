import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');

  if (isDashboard || isAdmin) {
    // Check if session cookie exists
    // Full JWT verification happens in the layout/API routes (Node.js runtime)
    const sessionCookie = request.cookies.get('ndps-session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Cookie exists — let the request through
    // The dashboard/admin layouts will verify the JWT and handle invalid tokens
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
