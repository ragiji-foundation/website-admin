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
  logApiCall(request, `Fetching career ${id}`);
  
  try {
    const career = await prisma.career.findUnique({
      where: { id: parseInt(id) }
    });

    if (!career) {
      return CrudResponses.notFound();
    }

    return apiSuccess(career);
  } catch (error) {
    return handleDatabaseError(error, 'Failed to fetch career');
  }
});

export const PUT = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Updating career ${id}`);
  
  try {
    const body = await request.json();
    
    // Validate required fields for update
    validateRequired(body, ['title', 'description']);

    const existingCareer = await prisma.career.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCareer) {
      return CrudResponses.notFound();
    }

    const updatedCareer = await prisma.career.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        titleHi: body.titleHi,
        description: body.description,
        descriptionHi: body.descriptionHi,
        requirements: body.requirements,
        requirementsHi: body.requirementsHi,
        location: body.location,
        locationHi: body.locationHi,
        type: body.type,
        typeHi: body.typeHi,
        isActive: body.isActive ?? true,
        updatedAt: new Date()
      }
    });

    return apiSuccess(updatedCareer, 'Career updated successfully');
  } catch (error) {
    return handleDatabaseError(error, 'Failed to update career');
  }
});

export const DELETE = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Deleting career ${id}`);
  
  try {
    const existingCareer = await prisma.career.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCareer) {
      return CrudResponses.notFound();
    }

    await prisma.career.delete({
      where: { id: parseInt(id) }
    });

    return apiSuccess(null, 'Career deleted successfully');
  } catch (error) {
    return handleDatabaseError(error, 'Failed to delete career');
  }
});

export const OPTIONS = handleOptionsWithParams;
