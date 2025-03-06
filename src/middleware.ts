import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsConfig } from '@/config/cors';

const allowedOriginsString = corsConfig.allowedOrigins.join(', ');

export function middleware(request: NextRequest) {
  const formSubmissionApiRoutes = ['/api/contact', '/api/join-us'];
  const requestPathname = new URL(request.url).pathname;

  const isFormSubmissionRoute = formSubmissionApiRoutes.includes(requestPathname);

  // Handle preflight requests for ALL api Routes
  if (request.url.includes('/api/') && request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOriginsString,
        'Access-Control-Allow-Methods': isFormSubmissionRoute ? 'GET, OPTIONS, POST' : 'GET, OPTIONS', // POST for form submissions only
        'Access-Control-Allow-Headers': [...corsConfig.allowedHeaders, 'Cache-Control'].join(', '),
        'Access-Control-Max-Age': corsConfig.maxAge.toString(),
      },
    });
  }

  // Handle GET and POST requests
  if (request.url.includes('/api/') && (request.method === 'GET' || request.method === 'POST')) {
    const origin = request.headers.get('origin') || '';

    if (corsConfig.allowedOrigins.includes(origin)) {
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', isFormSubmissionRoute ? 'GET, OPTIONS, POST' : 'GET, OPTIONS'); // POST for form submissions only
      response.headers.set('Access-Control-Allow-Headers', [...corsConfig.allowedHeaders, 'Cache-Control'].join(', '));

      return response;
    } else {
      return new NextResponse(null, { status: 403, statusText: 'Forbidden' });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*', // Apply to all API routes
  ],
};