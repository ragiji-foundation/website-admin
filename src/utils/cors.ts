import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed origins - add any domains that should be allowed to access the API
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.ragijifoundation.com',
  'https://ragijifoundation.com',
  'https://admin.ragijifoundation.com'
];

// Define allowed headers - add all headers that client requests might include
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

/**
 * Adds CORS headers to a NextResponse
 * @param response - The NextResponse to add headers to
 * @param request - The NextRequest object to extract origin
 * @returns NextResponse with CORS headers
 */
export function withCors<T>(response: NextResponse<T>, request?: NextRequest): NextResponse<T> {
  // Get the request origin if provided
  const origin = request?.headers.get('origin') || '*';

  // If the origin is in our allowed list, use it specifically (better security)
  // Otherwise default to '*' during development
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : '*';

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  return response;
}

/**
 * Handles OPTIONS preflight requests
 * @param request - The NextRequest object
 * @returns NextResponse configured for CORS preflight
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') || '*';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : '*';

  const response = new NextResponse(null, { status: 204 }); // No content needed for preflight

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

/**
 * Creates an error response with CORS headers
 * @param message - Error message
 * @param status - HTTP status code
 * @param request - The NextRequest object to extract origin
 * @returns NextResponse with CORS headers and error message
 */
export function corsError(message: string, status: number = 400, request?: NextRequest): NextResponse<{ error: string }> {
  const response = NextResponse.json({ error: message }, { status });
  return withCors(response, request);
}