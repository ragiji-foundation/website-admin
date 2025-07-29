import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  apiSuccess, 
  handleOptionsWithParams, 
  withApiHandler,
  validateRequired,
  CrudResponses,
  handleDatabaseError,
  logApiCall
} from '@/utils/centralized';

export const GET = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Fetching success story ${id}`);
  
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const story = await prisma.successStory.findUnique({
      where: { id: id }
    });

    if (!story) {
      return CrudResponses.notFound();
    }

    const localizedStory = {
      ...story,
      title: locale === 'hi' && story.titleHi ? story.titleHi : story.title,
      content: locale === 'hi' && story.contentHi ? story.contentHi : story.content,
      personName: locale === 'hi' && story.personNameHi ? story.personNameHi : story.personName,
      location: locale === 'hi' && story.locationHi ? story.locationHi : story.location,
    };

    return apiSuccess(localizedStory, 'Success story fetched successfully');
  } catch (error) {
    return handleDatabaseError(error, 'fetch success story');
  }
});

export const PUT = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Updating success story ${id}`);
  
  try {
    const body = await request.json();
    
    // Validate required fields for update
    validateRequired(body, ['title', 'content', 'personName']);
    
    const validFields = {
      title: body.title,
      titleHi: body.titleHi || '',
      content: typeof body.content === 'string' ? body.content : JSON.stringify(body.content),
      contentHi: body.contentHi ? (typeof body.contentHi === 'string' ? body.contentHi : JSON.stringify(body.contentHi)) : '',
      personName: body.personName,
      personNameHi: body.personNameHi || '',
      location: body.location || '',
      locationHi: body.locationHi || '',
      imageUrl: body.imageUrl || '',
      featured: body.featured ?? false,
      order: body.order || 0,
      slug: body.slug || '',
      updatedAt: new Date()
    };

    const updatedStory = await prisma.successStory.update({
      where: { id: id },
      data: validFields
    });

    return apiSuccess(updatedStory, 'Success story updated successfully');
  } catch (error) {
    return handleDatabaseError(error, 'update success story');
  }
});

export const DELETE = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Deleting success story ${id}`);
  
  try {
    await prisma.successStory.delete({
      where: { id: id }
    });

    return CrudResponses.deleted();
  } catch (error) {
    return handleDatabaseError(error, 'delete success story');
  }
});

export const OPTIONS = handleOptionsWithParams;
