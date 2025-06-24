import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const [story, model, visionMission, timeline] = await Promise.all([
      prisma.ourStory.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          titleHi: true,
          content: true,
          contentHi: true,
          media: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          version: true
        }
      }),
      prisma.ourModel.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          description: true,
          descriptionHi: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.visionMission.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          vision: true,
          visionHi: true,
          mission: true,
          missionHi: true,
          visionIcon: true,
          missionIcon: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.timeline.findMany({
        orderBy: [{ order: 'asc' }, { year: 'asc' }],
        select: {
          id: true,
          year: true,
          title: true,
          titleHi: true,
          centers: true,
          volunteers: true,
          children: true,
          order: true,
          createdAt: true,
          updatedAt: true
        }
      }),
    ]);

    const data = {
      story,
      model,
      visionMission,
      timeline,
    };

    return withCors(NextResponse.json(data));
  } catch (error) {
    console.error('Failed to fetch our story data:', error);
    return corsError('Failed to fetch data');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { modelType, ...payload } = data; // Expect a modelType to indicate which model to create

    switch (modelType) {
      case 'OurStory':
        if (typeof payload.media !== 'string') {
          payload.media = JSON.stringify(payload.media);
        }
        const newStory = await prisma.ourStory.create({ data: payload });
        return withCors(NextResponse.json(newStory, { status: 201 }));

      case 'OurModel':
        const newModel = await prisma.ourModel.create({ data: payload });
        return withCors(NextResponse.json(newModel, { status: 201 }));

      case 'VisionMission':
        const newVisionMission = await prisma.visionMission.create({ data: payload });
        return withCors(NextResponse.json(newVisionMission, { status: 201 }));

      case 'Timeline':
        const newTimelineItem = await prisma.timeline.create({ data: payload });
        return withCors(NextResponse.json(newTimelineItem, { status: 201 }));

      default:
        return corsError('Invalid model type for POST', 400);
    }
  } catch (error) {
    console.error('Failed to create data:', error);
    return corsError('Failed to create data', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { modelType, id, action, ...payload } = data; // Expect modelType and id

    if (!modelType) {
      return corsError('modelType is required for PUT requests', 400);
    }

    if (!id && action !== 'reorderTimeline') {
      return corsError('ID is required for PUT requests (except for reorderTimeline)', 400);
    }

    switch (modelType) {
      case 'OurStory':
        if (typeof payload.media !== 'string') {
          payload.media = JSON.stringify(payload.media);
        }

        const updatedStory = await prisma.ourStory.update({
          where: { id: id },
          data: payload,
        });
        return withCors(NextResponse.json(updatedStory, { status: 200 }));

      case 'OurModel':
        const updatedModel = await prisma.ourModel.update({
          where: { id: id },
          data: payload,
        });
        return withCors(NextResponse.json(updatedModel, { status: 200 }));

      case 'VisionMission':
        const updatedVisionMission = await prisma.visionMission.update({
          where: { id: id },
          data: payload,
        });
        return withCors(NextResponse.json(updatedVisionMission, { status: 200 }));

      case 'Timeline':
        if (action === 'reorderTimeline') {
          // Handle Timeline reordering within the PUT request
          if (typeof payload.order !== 'number') {
            return corsError('Order is required for reorderTimeline action', 400);
          }
          const updatedTimelineItem = await prisma.timeline.update({
            where: { id: id },
            data: { order: payload.order },
          });
          return withCors(NextResponse.json(updatedTimelineItem, { status: 200 }));
        }
        else {
          // Handle regular Timeline updates
          const updatedTimelineItem = await prisma.timeline.update({
            where: { id: id },
            data: payload,
          });
          return withCors(NextResponse.json(updatedTimelineItem, { status: 200 }));
        }

      default:
        return corsError('Invalid model type for PUT', 400);
    }
  } catch (error) {
    console.error('Failed to update data:', error);
    return corsError('Failed to update data', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelType = searchParams.get('modelType');
    const id = searchParams.get('id');

    if (!modelType || !id) {
      return corsError('modelType and id are required for DELETE requests', 400);
    }

    switch (modelType) {
      case 'Timeline':
        await prisma.timeline.delete({
          where: { id: id },
        });
        return withCors(NextResponse.json({ message: 'Timeline item deleted successfully' }, { status: 200 }));

      default:
        return corsError('Invalid model type for DELETE', 400);
    }
  } catch (error) {
    console.error('Failed to delete data:', error);
    return corsError('Failed to delete data', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}