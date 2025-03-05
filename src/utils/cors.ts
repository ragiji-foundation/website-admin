import { NextResponse } from 'next/server';

// Function to add CORS headers to a NextResponse
export function withCors(response: NextResponse): NextResponse {
  // Get the allowed origins from environment variable or use a default
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'https://www.ragijifoundation.com'];

  // Set basic CORS headers
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*'); // Consider restricting this in production
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Accept, Origin, Authorization'
  );

  return response;
}

export function corsError(message: string, status = 500) {
  return withCors(
    NextResponse.json(
      { error: message },
      { status }
    )
  );
}