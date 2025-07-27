import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const isHindi = locale === 'hi';

    const career = await prisma.career.findUnique({
      where: { slug }
    });

    if (!career) {
      return corsError('Career not found', 404);
    }

    // Return Hindi content if requested and available
    const localizedCareer = {
      ...career,
      title: isHindi && career.titleHi ? career.titleHi : career.title,
      description: isHindi && career.descriptionHi ? career.descriptionHi : career.description,
      requirements: isHindi && career.requirementsHi ? career.requirementsHi : career.requirements,
    };

    return withCors(NextResponse.json(localizedCareer));
  } catch (error) {
    console.error('Error fetching career:', error);
    return corsError('Failed to fetch career', 500);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;
    const data = await request.json();

    const existingCareer = await prisma.career.findUnique({
      where: { slug }
    });

    if (!existingCareer) {
      return corsError('Career not found', 404);
    }

    const updatedCareer = await prisma.career.update({
      where: { slug },
      data: {
        title: data.title || existingCareer.title,
        titleHi: data.titleHi !== undefined ? data.titleHi : existingCareer.titleHi,
        description: data.description || existingCareer.description,
        descriptionHi: data.descriptionHi !== undefined ? data.descriptionHi : existingCareer.descriptionHi,
        requirements: data.requirements || existingCareer.requirements,
        requirementsHi: data.requirementsHi !== undefined ? data.requirementsHi : existingCareer.requirementsHi,
        location: data.location || existingCareer.location,
        type: data.type || existingCareer.type,
        updatedAt: new Date()
      }
    });

    return withCors(NextResponse.json(updatedCareer));
  } catch (error) {
    console.error('Error updating career:', error);
    return corsError('Failed to update career', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;

    const existingCareer = await prisma.career.findUnique({
      where: { slug }
    });

    if (!existingCareer) {
      return corsError('Career not found', 404);
    }

    await prisma.career.delete({
      where: { slug }
    });

    return withCors(NextResponse.json({ message: 'Career deleted successfully' }));
  } catch (error) {
    console.error('Error deleting career:', error);
    return corsError('Failed to delete career', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
