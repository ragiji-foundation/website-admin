import { corsConfig } from '@/config/cors';
import { NextResponse } from 'next/server';

export function withCors<T>(response: NextResponse<T>) {
  const headers = new Headers(response.headers);

  const origin = response.headers.get('Origin');
  if (origin && corsConfig.allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else {
    headers.set('Access-Control-Allow-Origin', corsConfig.allowedOrigins[0]); // Default
  }

  headers.set('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
  headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  headers.set('Access-Control-Allow-Credentials', corsConfig.credentials.toString());

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}