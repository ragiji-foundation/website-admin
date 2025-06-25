import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existingCenter = await prisma.center.findUnique({
      where: { id },
    });

    if (!existingCenter) {
      return NextResponse.json(
        { error: 'Center not found' },
        { status: 404 }
      );
    }

    const updateData = {
      name: body.name,
      nameHi: body.nameHi || existingCenter.nameHi || '',
      location: body.location,
      locationHi: body.locationHi || existingCenter.locationHi || '',
      description: body.description,
      descriptionHi: body.descriptionHi || existingCenter.descriptionHi || '',
      imageUrl: body.imageUrl || existingCenter.imageUrl || '',
      contactInfo: body.contactInfo || existingCenter.contactInfo || '',
      updatedAt: new Date()
    };

    const updatedCenter = await prisma.center.update({
      where: { id },
      data: updateData,
    });

    return withCors(NextResponse.json(updatedCenter));
  } catch (error) {
    console.error('Failed to update center:', error);
    return corsError('Failed to update center');
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    await prisma.center.delete({
      where: { id }
    });

    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Failed to delete center:', error);
    return corsError('Failed to delete center');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}