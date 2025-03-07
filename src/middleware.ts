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

// Update the corsConfig to include production domain
const updatedAllowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://www.ragijifoundation.com',
  'https://ragijifoundation.com',
  ...(corsConfig.allowedOrigins || [])
];

// Convert array to string for logging
const allowedOriginsString = updatedAllowedOrigins.join(', ');
console.log('CORS allowed origins:', allowedOriginsString);

export function middleware(request: NextRequest) {
  // Extract URL information
  const url = new URL(request.url);
  const origin = request.headers.get('origin') || '';
  const isApiRoute = url.pathname.startsWith('/api/');

  // Detailed logging for debugging
  console.log(`[CORS] Request from origin: ${origin} to path: ${url.pathname}`);
  console.log(`[CORS] Is API route: ${isApiRoute}`);
  console.log(`[CORS] Method: ${request.method}`);
  console.log(`[CORS] Origin in allowed list: ${updatedAllowedOrigins.includes(origin)}`);

  // If not an API route, skip middleware processing
  if (!isApiRoute) {
    console.log('[CORS] Not an API route, skipping middleware');
    return NextResponse.next();
  }

  // Special handling for OPTIONS (preflight) requests
  if (request.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS preflight request');

    // Always allow the specific origin if in allowed list, otherwise use '*'
    const allowOrigin = updatedAllowedOrigins.includes(origin) ? origin : '*';
    console.log(`[CORS] Setting Access-Control-Allow-Origin: ${allowOrigin}`);

    return new NextResponse(null, {
      status: 204, // No content
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': allowedHeaders.join(', '),
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 hours
        // Add these headers to help with debugging
        'X-Debug-CORS': 'preflight-handled',
        'X-Allowed-Origins': allowedOriginsString.substring(0, 100), // Truncate if too long
      },
    });
  }

  // For actual API requests
  console.log('[CORS] Handling regular API request');
  const response = NextResponse.next();

  // Always allow the specific origin if in allowed list, otherwise use '*'
  const allowOrigin = updatedAllowedOrigins.includes(origin) ? origin : '*';
  console.log(`[CORS] Setting Access-Control-Allow-Origin: ${allowOrigin}`);

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Add a debug header
  response.headers.set('X-Debug-CORS', 'middleware-applied');

  return response;
}

export const config = {
  matcher: [
    '/api/:path*', // Apply to all API routes
  ],
};