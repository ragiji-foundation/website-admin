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
  logApiCall(request, 'Fetching centers');
  
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const centers = await prisma.center.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const localizedCenters = centers.map(center => ({
      ...center,
      name: locale === 'hi' && center.nameHi ? center.nameHi : center.name,
      location: locale === 'hi' && center.locationHi ? center.locationHi : center.location,
      description: locale === 'hi' && center.descriptionHi ? center.descriptionHi : center.description,
    }));

    return apiSuccess(localizedCenters, 'Centers fetched successfully');
  } catch (error) {
    return handleDatabaseError(error, 'fetch centers');
  }
});

export const POST = withApiHandler(async (request: NextRequest) => {
  logApiCall(request, 'Creating center');
  
  try {
    const body = await request.json();
    
    // Centralized validation
    validateRequired(body, ['name', 'location', 'description']);
    
    const validFields = {
      name: body.name,
      nameHi: body.nameHi || '',
      location: body.location,
      locationHi: body.locationHi || '',
      description: body.description,
      descriptionHi: body.descriptionHi || '',
      imageUrl: body.imageUrl || '',
      contactInfo: body.contactInfo || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const center = await prisma.center.create({
      data: validFields
    });

    return CrudResponses.created(center);
  } catch (error) {
    return handleDatabaseError(error, 'create center');
  }
});

export const OPTIONS = handleOptions;