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

    const currentInitiative = await prisma.initiative.findUnique({
      where: { id }
    });

    if (!currentInitiative) {
      return NextResponse.json({ error: 'Initiative not found' }, { status: 404 });
    }

    const adjacentInitiative = await prisma.initiative.findFirst({
      where: {
        order: direction === 'up'
          ? { lt: currentInitiative.order }
          : { gt: currentInitiative.order }
      },
      orderBy: {
        order: direction === 'up' ? 'desc' : 'asc'
      }
    });

    if (!adjacentInitiative) {
      return NextResponse.json({ error: 'Cannot move further' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.initiative.update({
        where: { id: currentInitiative.id },
        data: { order: adjacentInitiative.order }
      }),
      prisma.initiative.update({
        where: { id: adjacentInitiative.id },
        data: { order: currentInitiative.order }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering initiative:', error);
    return NextResponse.json(
      { error: 'Failed to reorder initiative' },
      { status: 500 }
    );
  }
} 