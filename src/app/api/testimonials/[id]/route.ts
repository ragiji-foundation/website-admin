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
  logApiCall(request, `Fetching testimonial ${id}`);
  
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: parseInt(id) }
    });

    if (!testimonial) {
      return CrudResponses.notFound();
    }

    const localizedTestimonial = {
      ...testimonial,
      name: locale === 'hi' && testimonial.nameHi ? testimonial.nameHi : testimonial.name,
      role: locale === 'hi' && testimonial.roleHi ? testimonial.roleHi : testimonial.role,
      content: locale === 'hi' && testimonial.contentHi ? testimonial.contentHi : testimonial.content,
    };

    return apiSuccess(localizedTestimonial, 'Testimonial fetched successfully');
  } catch (error) {
    return handleDatabaseError(error, 'fetch testimonial');
  }
});

export const PUT = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Updating testimonial ${id}`);
  
  try {
    const body = await request.json();
    
    // Validate required fields for update
    validateRequired(body, ['name', 'content']);
    
    const validFields = {
      name: body.name,
      nameHi: body.nameHi || '',
      role: body.role || '',
      roleHi: body.roleHi || '',
      content: body.content,
      contentHi: body.contentHi || '',
      avatar: body.avatar || '',
      isPublished: body.isPublished ?? true,
      updatedAt: new Date()
    };

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: validFields
    });

    return apiSuccess(updatedTestimonial, 'Testimonial updated successfully');
  } catch (error) {
    return handleDatabaseError(error, 'update testimonial');
  }
});

export const DELETE = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Deleting testimonial ${id}`);
  
  try {
    await prisma.testimonial.delete({
      where: { id: parseInt(id) }
    });

    return CrudResponses.deleted();
  } catch (error) {
    return handleDatabaseError(error, 'delete testimonial');
  }
});

export const OPTIONS = handleOptionsWithParams;