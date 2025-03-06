import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define allowed origins
const allowedOrigins = [
  'https://www.ragijifoundation.com',
  'https://ragijifoundation.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Helper function to check if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin); // Remove vercel.app check for production
}

/**
 * Apply CORS headers to a response
 *
 * @param response The NextResponse object
 * @param request Optional NextRequest to extract origin
 * @returns Response with CORS headers
 */
export function withCors(response: NextResponse, request?: NextRequest): NextResponse {
  let origin: string | undefined = undefined;

  if (request?.headers.get('origin')) {
    const requestOrigin = request.headers.get('origin');
    if (requestOrigin && isOriginAllowed(requestOrigin)) {
      origin = requestOrigin;
    }
  }

  // Add CORS headers
  if (origin) { // Only set CORS headers if a valid origin is present
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

/**
 * Return an error response with CORS headers
 *
 * @param message Error message
 * @param status HTTP status code
 * @param request Optional NextRequest to extract origin
 * @returns NextResponse with error and CORS headers
 */
export function corsError(message: string, status: number = 500, request?: NextRequest): NextResponse {
  const response = NextResponse.json(
    { error: message },
    { status }
  );

  return withCors(response, request);
}