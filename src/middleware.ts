import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = ['/auth/login', '/api/login', '/api/contact'];

export async function middleware(request: NextRequest) {
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Allow public paths without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }

  try {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET environment variable not set!");
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Verify the token
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();

  } catch (error) {
    console.error('Auth error:', error);
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('authToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/',
    '/api/:path*',
    '/blogs/:path*',
    '/pages/:path*',
    '/navigation/:path*',
    '/auth/:path*'
  ],
};