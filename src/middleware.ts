import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsConfig } from '@/config/cors';

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

const allowedOriginsString = corsConfig.allowedOrigins.join(', ');

export function middleware(request: NextRequest) {
  // Extract URL information
  const url = new URL(request.url);
  const origin = request.headers.get('origin') || '';
  const isApiRoute = url.pathname.startsWith('/api/');

  // If not an API route, skip middleware processing
  if (!isApiRoute) {
    return NextResponse.next();
  }

  // Special handling for OPTIONS (preflight) requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204, // No content
      headers: {
        'Access-Control-Allow-Origin': corsConfig.allowedOrigins.includes(origin) ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': allowedHeaders.join(', '),
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  // For actual API requests
  const response = NextResponse.next();

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', corsConfig.allowedOrigins.includes(origin) ? origin : '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

export const config = {
  matcher: [
    '/api/:path*', // Apply to all API routes
  ],
};