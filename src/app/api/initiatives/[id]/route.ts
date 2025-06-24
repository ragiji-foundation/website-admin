import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';



export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid initiative ID' }, { status: 400 });
    }

    const initiative = await prisma.initiative.findUnique({
      where: { id }
    });

    if (!initiative) {
      return NextResponse.json({ error: 'Initiative not found' }, { status: 404 });
    }

    return withCors(NextResponse.json(initiative));
  } catch (error) {
    console.error('Failed to fetch initiative:', error);
    return corsError('Failed to fetch initiative');
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid initiative ID' }, { status: 400 });
    }

    const body = await request.json();

    // Basic validation
    if (!body.title?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const existingInitiative = await prisma.initiative.findUnique({
      where: { id }
    });

    if (!existingInitiative) {
      return NextResponse.json({ error: 'Initiative not found' }, { status: 404 });
    }

    const updateData = {
      title: body.title,
      titleHi: body.titleHi || existingInitiative.titleHi || '',
      description: body.description,
      descriptionHi: body.descriptionHi || existingInitiative.descriptionHi || '',
      imageUrl: body.imageUrl || existingInitiative.imageUrl,
      order: body.order || existingInitiative.order,
      updatedAt: new Date()
    };

    const updatedInitiative = await prisma.initiative.update({
      where: { id },
      data: updateData
    });

    const transformedInitiative = {
      id: updatedInitiative.id,
      title: updatedInitiative.title,
      titleHi: updatedInitiative.titleHi,
      description: updatedInitiative.description,
      descriptionHi: updatedInitiative.descriptionHi,
      imageUrl: updatedInitiative.imageUrl,
      order: updatedInitiative.order,
      createdAt: updatedInitiative.createdAt,
      updatedAt: updatedInitiative.updatedAt
    };

    return withCors(NextResponse.json(transformedInitiative));
  } catch (error) {
    console.error('Failed to update initiative:', error);
    return corsError('Failed to update initiative');
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid initiative ID' }, { status: 400 });
    }

    await prisma.initiative.delete({
      where: { id }
    });

    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Failed to delete initiative:', error);
    return corsError('Failed to delete initiative');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}