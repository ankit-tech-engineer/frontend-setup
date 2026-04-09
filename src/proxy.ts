import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken');

  // Define public corridors (auth pages)
  const isAuthPage = pathname.startsWith('/login') || 
                    pathname.startsWith('/register') || 
                    pathname.startsWith('/verify-otp') || 
                    pathname.startsWith('/set-password');

  // Define protected corridors (dashboard pages)
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname === '/';

  if (!accessToken && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (accessToken && isAuthPage) {
    // If user is already logged in, we let the client-side redirection handle the specific dashboard
    // but as a fallback, we redirect to a general dashboard or let it load
    // To be safer, we can redirect to a check page or just the root
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
