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

const allowedOrigins = [
  'https://www.ragijifoundation.com',
  'https://ragijifoundation.com',
  'http://localhost:3000',
   'http://localhost:3001'
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
    const origin = request.headers.get('origin') || '';
    const response = new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
    return response;
  }

  // Allow public paths without authentication
  if (isPublic) {
    return NextResponse.next();
  }

  // Check if the request is for the API
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Get the origin from the request headers
    const origin = request.headers.get('origin') || '';

    // Create the response
    const response = NextResponse.next();

    // Add CORS headers if origin is allowed
    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    // Common CORS headers
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

    return response;
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