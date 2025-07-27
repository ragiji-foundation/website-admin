import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsConfig } from '@/config/cors';
import { jwtVerify } from 'jose';

// Define all allowed headers
const allowedHeaders = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Cache-Control',
  'X-Auth-Token',
  'Origin',
  'Pragma',
  'Referer',
  'User-Agent'
];

// Update the corsConfig to include production domain
const updatedAllowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://www.ragijifoundation.com',
  'https://ragijifoundation.com',
  ...(corsConfig.allowedOrigins || [])
];

// JWT verification
const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const key = new TextEncoder().encode(secretKey);

async function verifyAuth(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) return false;
    
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

// Protected routes that require authentication
const protectedRoutes = [
  '/api/blogs',
  '/api/carousel',
  '/api/features',
  '/api/testimonials',
  '/api/initiatives',
  '/api/news-coverage',
  '/api/gallery',
  '/api/settings',
  '/api/upload',
  '/api/the-need',
  '/api/our-story',
  '/api/dashboard'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/api/login',
  '/api/logout',
  '/api/contact',
  '/api/join-us',
  '/api/search',
  '/api/enquiries'
];

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin') || '';
  const isApiRoute = url.pathname.startsWith('/api/');
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));

  // Handle CORS for API routes
  if (isApiRoute) {
    // Special handling for OPTIONS (preflight) requests
    if (request.method === 'OPTIONS') {
      const allowOrigin = updatedAllowedOrigins.includes(origin) ? origin : '*';
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': allowedHeaders.join(', '),
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Check authentication for protected API routes
    if (isProtectedRoute && !isPublicRoute) {
      const isAuthenticated = await verifyAuth(request);
      if (!isAuthenticated) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { 
            status: 401,
            headers: {
              'Access-Control-Allow-Origin': updatedAllowedOrigins.includes(origin) ? origin : '*',
              'Access-Control-Allow-Credentials': 'true',
            }
          }
        );
      }
    }

    // Apply CORS headers to API responses
    const response = NextResponse.next();
    const allowOrigin = updatedAllowedOrigins.includes(origin) ? origin : '*';
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // Handle authentication for admin pages
  const isAuthPage = url.pathname.startsWith('/auth');
  const isAdminPage = !isAuthPage && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api');

  if (isAdminPage) {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthPage && url.pathname === '/auth/login') {
    const isAuthenticated = await verifyAuth(request);
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};