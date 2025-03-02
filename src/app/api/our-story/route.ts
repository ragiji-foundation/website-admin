import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

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

    return withCors(NextResponse.json(data));
  } catch (error) {
    console.error('Failed to fetch our story data:', error);
    return corsError('Failed to fetch data');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
