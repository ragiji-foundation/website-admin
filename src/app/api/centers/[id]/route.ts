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
  logApiCall(request, `Fetching center ${id}`);
  
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const center = await prisma.center.findUnique({
      where: { id: parseInt(id) }
    });

    if (!center) {
      return CrudResponses.notFound();
    }

    const localizedCenter = {
      ...center,
      name: locale === 'hi' && center.nameHi ? center.nameHi : center.name,
      location: locale === 'hi' && center.locationHi ? center.locationHi : center.location,
      description: locale === 'hi' && center.descriptionHi ? center.descriptionHi : center.description,
    };

    return apiSuccess(localizedCenter, 'Center fetched successfully');
  } catch (error) {
    return handleDatabaseError(error, 'fetch center');
  }
});

export const PUT = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Updating center ${id}`);
  
  try {
    const body = await request.json();
    
    // Validate required fields for update
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
      updatedAt: new Date()
    };

    const updatedCenter = await prisma.center.update({
      where: { id: parseInt(id) },
      data: validFields
    });

    return apiSuccess(updatedCenter, 'Center updated successfully');
  } catch (error) {
    return handleDatabaseError(error, 'update center');
  }
});

export const DELETE = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Deleting center ${id}`);
  
  try {
    await prisma.center.delete({
      where: { id: parseInt(id) }
    });

    return CrudResponses.deleted();
  } catch (error) {
    return handleDatabaseError(error, 'delete center');
  }
});

export const OPTIONS = handleOptionsWithParams;