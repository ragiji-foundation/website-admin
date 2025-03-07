import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, data: eventData, path } = data;

    const cookieStore = cookies();
    const visitorId = cookieStore.get('visitor_id')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    if (!visitorId || !sessionId) {
      return NextResponse.json({ error: 'Missing visitor or session ID' }, { status: 400 });
    }

    // Store event in database
    // Note: You'll need to create an Event model in your schema
    await prisma.$executeRaw`
      INSERT INTO events (name, data, path, visitor_id, session_id, timestamp)
      VALUES (${name}, ${JSON.stringify(eventData)}, ${path}, ${visitorId}, ${sessionId}, NOW())
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
