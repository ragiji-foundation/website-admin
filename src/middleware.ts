import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsConfig, MAIN_WEBSITE } from '@/config/cors';

export function middleware(request: NextRequest) {
  // Early return if not an API route
  if (!request.url.includes('/api/')) {
    return NextResponse.next();
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': MAIN_WEBSITE,
        'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
        'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
        'Access-Control-Max-Age': corsConfig.maxAge.toString(),
      },
    });
  }

  // Handle GET requests
  if (request.method === 'GET') {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', MAIN_WEBSITE);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};