import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = parseInt(context.params.id);
    const { direction } = await request.json();
    const url = new URL(request.url);

    // Get current media item
    const currentMedia = await prisma.electronicMedia.findUnique({
      where: { id }
    });

    if (!currentMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Get adjacent media item based on direction
    const adjacentMedia = await prisma.electronicMedia.findFirst({
      where: {
        order: direction === 'up'
          ? { lt: currentMedia.order }
          : { gt: currentMedia.order }
      },
      orderBy: {
        order: direction === 'up' ? 'desc' : 'asc'
      }
    });

    if (!adjacentMedia) {
      return NextResponse.json({ error: 'Cannot move further' }, { status: 400 });
    }

    // Swap orders
    await prisma.$transaction([
      prisma.electronicMedia.update({
        where: { id: currentMedia.id },
        data: { order: adjacentMedia.order }
      }),
      prisma.electronicMedia.update({
        where: { id: adjacentMedia.id },
        data: { order: currentMedia.order }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering media:', error);
    return NextResponse.json(
      { error: 'Failed to reorder media' },
      { status: 500 }
    );
  }
} 