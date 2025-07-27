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
  logApiCall(request, `Fetching gallery item ${id}`);
  
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const item = await prisma.gallery.findUnique({
      where: { id: parseInt(id) }
    });

    if (!item) {
      return CrudResponses.notFound();
    }

    const localizedItem = {
      ...item,
      title: locale === 'hi' && item.titleHi ? item.titleHi : item.title,
      description: locale === 'hi' && item.descriptionHi ? item.descriptionHi : (item.description || ''),
    };

    return apiSuccess(localizedItem, 'Gallery item fetched successfully');
  } catch (error) {
    return handleDatabaseError(error, 'fetch gallery item');
  }
});

export const PUT = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Updating gallery item ${id}`);
  
  try {
    const body = await request.json();
    
    // Validate required fields for update
    validateRequired(body, ['title']);
    
    const validFields = {
      title: body.title,
      titleHi: body.titleHi || '',
      category: body.category || 'general',
      description: body.description || '',
      descriptionHi: body.descriptionHi || '',
      updatedAt: new Date()
    };

    const updatedItem = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data: validFields
    });

    return apiSuccess(updatedItem, 'Gallery item updated successfully');
  } catch (error) {
    return handleDatabaseError(error, 'update gallery item');
  }
});

export const DELETE = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Deleting gallery item ${id}`);
  
  try {
    await prisma.gallery.delete({
      where: { id: parseInt(id) }
    });

    return CrudResponses.deleted();
  } catch (error) {
    return handleDatabaseError(error, 'delete gallery item');
  }
});

export const OPTIONS = handleOptionsWithParams;