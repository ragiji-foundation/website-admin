import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://www.ragijifoundation.com',
  'https://ragijifoundation.com',
];

// Helper function to check if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin) || origin.endsWith('vercel.app');
}

/**
 * Apply CORS headers to a response
 *
 * @param response The NextResponse object
 * @param request Optional NextRequest to extract origin
 * @returns Response with CORS headers
 */
export function withCors(response: NextResponse, request?: NextRequest) {
  // Get origin from request or default to *
  let origin: string = '*'; // Initialize with a default string value

  if (request?.headers.get('origin')) {
    const requestOrigin = request.headers.get('origin');
    if (requestOrigin && isOriginAllowed(requestOrigin)) { // Check if requestOrigin is not null or undefined
      origin = requestOrigin;
    }
  }

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

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
export function corsError(message: string, status: number = 500, request?: NextRequest) {
  const response = NextResponse.json(
    { error: message },
    { status }
  );

  return withCors(response, request);
}