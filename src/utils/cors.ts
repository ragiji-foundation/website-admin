import { corsConfig } from '@/config/cors';
import { NextResponse } from 'next/server';

export function withCors<T>(response: NextResponse<T>) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', corsConfig.allowedOrigins[0]);
  headers.set('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
  headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  headers.set('Access-Control-Allow-Credentials', corsConfig.credentials.toString());

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function corsError(message: string, status = 400) {
  return withCors(
    NextResponse.json({ error: message }, { status })
  );
}
