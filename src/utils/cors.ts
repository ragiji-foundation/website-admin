import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed origins - add any domains that should be allowed to access the API
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.ragijifoundation.com',
  'https://ragijifoundation.com',
  'https://admin.ragijifoundation.com'
];

/**
 * Adds CORS headers to a NextResponse
 * @param response - The NextResponse to add headers to
 * @param origin - The origin making the request
 * @returns NextResponse with CORS headers
 */
export function withCors<T>(response: NextResponse<T>): NextResponse<T> {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  return response;
}

/**
 * Creates an error response with CORS headers
 * @param message - Error message
 * @param status - HTTP status code
 * @param origin - Request origin
 * @returns NextResponse with CORS headers and error message
 */
export function corsError(message: string, status: number = 400): NextResponse<{ error: string }> {
  const response = NextResponse.json({ error: message }, { status });
  return withCors(response);
}