import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, data: eventData, path } = data;

    // Get cookies from request instead of using the cookies() API
    const cookieHeader = request.headers.get('cookie') || '';
    const parsedCookies = parseCookies(cookieHeader);

    const visitorId = parsedCookies['visitor_id'];
    const sessionId = parsedCookies['session_id'];

    if (!visitorId || !sessionId) {
      return NextResponse.json({ error: 'Missing visitor or session ID' }, { status: 400 });
    }

    // Use Prisma's create method instead of raw SQL for type safety
    await prisma.event.create({
      data: {
        name,
        data: eventData as any, // Cast to any since we're storing JSON
        path,
        visitorId,
        sessionId,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

// Helper function to parse cookies from a cookie header
function parseCookies(cookieHeader: string) {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}
