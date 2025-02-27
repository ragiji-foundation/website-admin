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
  '/api/upload',  // Add this to allow image uploads
  '/api/enquiries',  // Add this to allow enquiries
  '/api/join-us',  // Add this to allow join us
  '/api/subscribe',  // Add this to allow subscribe
  '/api/subscribe/:path*',  // Add this to allow subscribe
];

const allowedOrigins = [
  'https://www.ragijifoundation.com',
  'https://ragijifoundation.com',
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsMiddleware = (request: NextRequest, response: NextResponse) => {
  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
};

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
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return corsMiddleware(request, response);
  }

  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPublic = isPublicPath(request.nextUrl.pathname, request);

  // For API routes
  if (isApiRoute) {
    if (isPublic) {
      const response = NextResponse.next();
      return corsMiddleware(request, response);
    }

    try {
      // Auth check for protected routes
      const token = request.cookies.get('authToken')?.value;
      if (!token) {
        const response = NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
        return corsMiddleware(request, response);
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        const response = NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
        return corsMiddleware(request, response);
      }

      await jwtVerify(token, new TextEncoder().encode(secret));
      const response = NextResponse.next();
      return corsMiddleware(request, response);
    } catch (error) {
      const response = NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
      return corsMiddleware(request, response);
    }
  }

  // For non-API routes
  return NextResponse.next();
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