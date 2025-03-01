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

    return NextResponse.json({
      story,
      model,
      visionMission,
      timeline
    });
  } catch (error) {
    console.error('Failed to fetch our story data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
