import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  title?: string;
}

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
    const { modelType, ...payload } = data;

    switch (modelType) {
      case 'OurStory': {
        // Enforce single record
        const existing = await prisma.ourStory.findFirst();
        if (existing) {
          return corsError('OurStory already exists. Use PUT to update.', 409);
        }
        if (typeof payload.media !== 'string') {
          payload.media = JSON.stringify(payload.media);
        }
        const newStory = await prisma.ourStory.create({ data: payload });
        return withCors(NextResponse.json(newStory, { status: 201 }));
      }
      case 'OurModel': {
        const existing = await prisma.ourModel.findFirst();
        if (existing) {
          return corsError('OurModel already exists. Use PUT to update.', 409);
        }
        const newModel = await prisma.ourModel.create({ data: payload });
        return withCors(NextResponse.json(newModel, { status: 201 }));
      }
      case 'VisionMission': {
        const existing = await prisma.visionMission.findFirst();
        if (existing) {
          return corsError('VisionMission already exists. Use PUT to update.', 409);
        }
        const newVisionMission = await prisma.visionMission.create({ data: payload });
        return withCors(NextResponse.json(newVisionMission, { status: 201 }));
      }
      case 'Timeline': {
        const newTimelineItem = await prisma.timeline.create({ data: payload });
        return withCors(NextResponse.json(newTimelineItem, { status: 201 }));
      }
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
    // Log the request URL and params for debugging
    console.log('PUT Request URL:', request.url);
    
    const data = await request.json();
    const { modelType, id, action, ...payload } = data;
    
    // Log the parsed data for debugging
    console.log('PUT Request Data:', { modelType, id, action });

    if (!modelType) {
      return corsError('modelType is required for PUT requests', 400);
    }
    if (!id && action !== 'reorderTimeline') {
      return corsError('ID is required for PUT requests (except for reorderTimeline)', 400);
    }
    
    // Enhanced validation logging
    console.log('Validating record existence:', { modelType, id, action });
    
    let existingRecord;
    try {
      switch (modelType) {
        case 'OurStory':
          existingRecord = await prisma.ourStory.findUnique({ where: { id } });
          break;
        case 'OurModel':
          existingRecord = await prisma.ourModel.findUnique({ where: { id } });
          break;
        case 'VisionMission':
          existingRecord = await prisma.visionMission.findUnique({ where: { id } });
          break;
        case 'Timeline':
          if (action !== 'reorderTimeline') {
            existingRecord = await prisma.timeline.findUnique({ where: { id } });
          }
          break;
      }
      
      console.log('Record lookup result:', { 
        found: !!existingRecord, 
        modelType, 
        id,
        recordId: existingRecord?.id 
      });
      
      if (!existingRecord && action !== 'reorderTimeline') {
        console.error(`Record not found for modelType: ${modelType}, id: ${id}`);
        return corsError(`${modelType} with id ${id} not found. Please check if the ID is correct.`, 404);
      }
    } catch (lookupError) {
      console.error('Error during record lookup:', lookupError);
      return corsError(`Error validating ${modelType} with id ${id}`, 500);
    }

    // Helper to delete old media
    const deleteMedia = async (url: string): Promise<boolean> => {
      if (!url) return true;
      try {
        const response = await fetch(process.env.MEDIA_DELETE_API || '/api/media-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (!response.ok) {
          console.error('Failed to delete media:', await response.text());
          return false;
        }
        return true;
      } catch (err) {
        console.error('Failed to delete media:', err);
        return false;
      }
    };

    switch (modelType) {
      case 'OurStory': {
        console.log('Processing OurStory update for ID:', id);
        
        // First verify the record exists
        const existing = await prisma.ourStory.findUnique({ 
          where: { id },
          select: {
            id: true,
            media: true,
            version: true
          }
        });

        if (!existing) {
          console.error('Story not found with ID:', id);
          return corsError(`Story with ID ${id} not found`, 404);
        }

        console.log('Found existing story:', existing);

        // Handle media arrays
        let oldMedia: MediaItem[] = [];
        let newMedia: MediaItem[] = [];
        
        try {
          oldMedia = typeof existing.media === 'string'
            ? JSON.parse(existing.media)
            : existing.media || [];

          newMedia = Array.isArray(payload.media) 
            ? payload.media 
            : typeof payload.media === 'string'
              ? JSON.parse(payload.media)
              : [];

          console.log('Media comparison:', {
            oldMediaCount: oldMedia.length,
            newMediaCount: newMedia.length
          });
        } catch (e) {
          console.error('Error processing media:', e);
          return corsError('Invalid media data format', 400);
        }
        
        // Delete old media files not present in new media
        const mediaToDelete = oldMedia.filter(item => 
          item.url && !newMedia.some(m => m.url === item.url)
        );
        
        if (mediaToDelete.length > 0) {
          console.log('Deleting old media items:', mediaToDelete.length);
          const deletionResults = await Promise.all(
            mediaToDelete.map(item => deleteMedia(item.url))
          );
          
          const failedDeletions = deletionResults.filter(result => !result).length;
          if (failedDeletions > 0) {
            console.error(`Failed to delete ${failedDeletions} media items`);
          }
        }

        // Prepare payload for update
        const updatePayload = {
          ...payload,
          media: Array.isArray(payload.media) ? JSON.stringify(payload.media) : payload.media,
          version: (existing.version || 0) + 1
        };

        console.log('Updating story with payload:', {
          id,
          mediaType: typeof updatePayload.media,
          version: updatePayload.version
        });

        try {
          const updatedStory = await prisma.ourStory.update({
            where: { id },
            data: updatePayload,
          });

          console.log('Story updated successfully:', updatedStory.id);
          return withCors(NextResponse.json(updatedStory, { status: 200 }));
        } catch (updateError) {
          console.error('Error updating story:', updateError);
          throw updateError;
        }
      }
      case 'OurModel': {
        // Handle image deletion if image is updated
        const existing = await prisma.ourModel.findUnique({ where: { id } });
        if (existing?.imageUrl && payload.imageUrl && payload.imageUrl !== existing.imageUrl) {
          await deleteMedia(existing.imageUrl);
        }
        const updatedModel = await prisma.ourModel.update({
          where: { id },
          data: payload,
        });
        return withCors(NextResponse.json(updatedModel, { status: 200 }));
      }
      case 'VisionMission': {
        // Handle icon deletion if icon is updated
        const existing = await prisma.visionMission.findUnique({ where: { id } });
        if (existing?.visionIcon && payload.visionIcon && payload.visionIcon !== existing.visionIcon) {
          await deleteMedia(existing.visionIcon);
        }
        if (existing?.missionIcon && payload.missionIcon && payload.missionIcon !== existing.missionIcon) {
          await deleteMedia(existing.missionIcon);
        }
        const updatedVisionMission = await prisma.visionMission.update({
          where: { id },
          data: payload,
        });
        return withCors(NextResponse.json(updatedVisionMission, { status: 200 }));
      }
      case 'Timeline': {
        if (action === 'reorderTimeline') {
          const timelineItems = Array.isArray(payload.items) ? payload.items : [];
          // Update order for each item
          interface TimelineItem {
            id: string;
          }
          
          const updates = timelineItems.map((item: TimelineItem, index: number) =>
            prisma.timeline.update({
              where: { id: item.id },
              data: { order: index },
            })
          );
          await Promise.all(updates);
          return withCors(NextResponse.json({ message: 'Timeline reordered successfully' }, { status: 200 }));
        } else {
          const updatedTimelineItem = await prisma.timeline.update({
            where: { id },
            data: payload,
          });
          return withCors(NextResponse.json(updatedTimelineItem, { status: 200 }));
        }
      }
      default:
        return corsError('Invalid model type for PUT', 400);
    }
  } catch (error) {
    console.error('Failed to update data:', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return corsError('Record not found', 404);
      }
      if (error.message.includes('Invalid ID')) {
        return corsError('Invalid ID format', 400);
      }
    }
    
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