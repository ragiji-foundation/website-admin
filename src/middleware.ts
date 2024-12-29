import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Skip CORS check for OPTIONS requests (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.ragijifoundation.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Skip auth for public API endpoints
    if (request.nextUrl.pathname.startsWith('/api/contact')) {
      const response = NextResponse.next();
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', 'https://www.ragijifoundation.com');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
    }

    const cookieHeader = request.headers.get('Cookie');

    if (!cookieHeader) {
      console.log("No cookie header found.");
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const authToken = cookieHeader.split('; ').find((c) => c.startsWith('authToken='));
    if (!authToken) {
      console.log("No auth token found in cookie");
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const token = authToken.split('=')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET environment variable not set!");
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Verify the token
    await jwtVerify(token, new TextEncoder().encode(secret));

    // If verification successful, proceed with CORS headers
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', 'https://www.ragijifoundation.com');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Middleware error:', errorMessage);

    // Clear the potentially invalid authToken cookie and redirect
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('authToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/',
    '/blogs/:path*',
    '/pages/:path*',
    '/navigation/:path*'
  ],
};