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

    const initiative = await prisma.initiative.update({
      where: { id },
      data: {
        title: body.title.trim(),
        description: body.description.trim(), // This can contain rich HTML content
        imageUrl: body.imageUrl?.trim() || null,
        order: body.order || 0
      }
    });

    return withCors(NextResponse.json(initiative));
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