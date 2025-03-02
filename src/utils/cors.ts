import { corsConfig } from '@/config/cors';
import { NextResponse } from 'next/server';

export function getCorsHeaders(origin: string | null) {
  // Always allow the main website
  const MAIN_WEBSITE = 'https://www.ragijifoundation.com';

  return {
    'Access-Control-Allow-Origin': MAIN_WEBSITE,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function withCors<T>(response: NextResponse<T>) {
  const headers = new Headers(response.headers);
  const corsHeaders = getCorsHeaders(null);

  // Apply CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function corsError(message: string, status = 500) {
  return withCors(
    NextResponse.json(
      { error: message },
      { status }
    )
  );
}