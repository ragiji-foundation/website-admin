import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [story, model, visionMission, timeline] = await Promise.all([
      prisma.ourStory.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.ourModel.findFirst({
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.visionMission.findFirst({
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.timeline.findMany({
        orderBy: [
          { order: 'asc' },
          { year: 'asc' }
        ]
      })
    ]);

    const data = {
      story,
      model,
      visionMission,
      timeline
    };

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to fetch our story data:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
