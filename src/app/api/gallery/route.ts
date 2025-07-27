import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  apiSuccess, 
  handleOptions, 
  withApiHandler,
  validateRequired,
  CrudResponses,
  handleDatabaseError,
  logApiCall
} from '@/utils/centralized';

export const GET = withApiHandler(async (request: NextRequest) => {
  logApiCall(request, 'Fetching gallery items');
  
  try {
    const gallery = await prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return apiSuccess(gallery, 'Gallery items fetched successfully');
  } catch (error) {
    handleDatabaseError(error, 'fetch gallery items');
  }
});

export const POST = withApiHandler(async (request: NextRequest) => {
  logApiCall(request, 'Creating gallery item');
  
  try {
    const body = await request.json();
    
    // Centralized validation
    validateRequired(body, ['title', 'imageUrl']);
    
    const validFields = {
      title: body.title,
      imageUrl: body.imageUrl,
      category: body.category || 'general',
      description: body.description || '',
    };

    const galleryItem = await prisma.gallery.create({
      data: validFields
    });

    const responseData = {
      ...galleryItem,
      publicId: body.publicId || null
    };

    return CrudResponses.created(responseData);
  } catch (error) {
    handleDatabaseError(error, 'create gallery item');
  }
});

export const OPTIONS = handleOptions;