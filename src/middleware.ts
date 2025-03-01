import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsConfig } from '@/config/cors';

function getCorsHeaders(origin: string | null) {
  const validOrigin = origin && corsConfig.allowedOrigins.includes(origin)
    ? origin
    : corsConfig.allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': validOrigin,
    'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': corsConfig.credentials.toString(),
    'Access-Control-Max-Age': corsConfig.maxAge.toString(),
  };
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  }

  // Handle actual requests
  const response = NextResponse.next();
  const headers = getCorsHeaders(origin);

  // Apply CORS headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/images/:path*',
    '/uploads/:path*'
  ],
};