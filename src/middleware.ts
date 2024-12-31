import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = [
  '/auth/login',
  '/api/login',
  '/api/contact',
  '/api/blogs',           // Public blog reading
  '/api/categories',      // Public category reading
  '/api/tags',           // Public tag reading
  '/api/testimonials',    // Public testimonial reading
  '/api/upload'  // Add this to allow image uploads
];

// Update the isPublicPath check to include the request parameter
const isPublicPath = (path: string, request: NextRequest) => {
  return publicPaths.some(publicPath => {
    // Exact match
    if (path === publicPath) return true;
    // Check if it's a GET request to a public path
    if (path.startsWith(publicPath + '/') && request.method === 'GET') return true;
    return false;
  });
};

export async function middleware(request: NextRequest) {
  const isPublic = isPublicPath(request.nextUrl.pathname, request);

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
  if (isPublic) {
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
    '/auth/:path*',
    '/admin/:path*',
    '/testimonials/:path*',
    '/enquiries/:path*',
    '/settings/:path*',
    '/logo/:path*',
    '/header/:path*',
    '/navbar/:path*',
    '/footer/:path*'
  ],
};