import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid center ID' }, { status: 400 });
    }

    const body = await request.json();
    
    const center = await prisma.center.update({
      where: { id: parsedId },
      data: {
        name: body.name,
        nameHi: body.nameHi || '',
        location: body.location,
        locationHi: body.locationHi || '',
        description: body.description,
        descriptionHi: body.descriptionHi || '',
        imageUrl: body.imageUrl || '',
        contactInfo: body.contactInfo || '',
        updatedAt: new Date()
      }
    });

    return withCors(NextResponse.json(center));
  } catch (error) {
    console.error('Failed to update center:', error);
    return corsError('Failed to update center');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid center ID' }, { status: 400 });
    }

    await prisma.center.delete({
      where: { id: parsedId }
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