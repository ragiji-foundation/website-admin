import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = context.params.id;
    if (!id) {
      return NextResponse.json({ error: 'Invalid banner ID' }, { status: 400 });
    }

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return withCors(NextResponse.json(banner));
  } catch (error) {
    console.error('Failed to fetch banner:', error);
    return corsError('Failed to fetch banner');
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = context.params.id;
    if (!id) {
      return NextResponse.json({ error: 'Invalid banner ID' }, { status: 400 });
    }

    const body = await request.json();

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: body.title,
        titleHi: body.titleHi,
        description: body.description,
        descriptionHi: body.descriptionHi,
        backgroundImage: body.backgroundImage,
        type: body.type,
        updatedAt: new Date()
      }
    });

    return withCors(NextResponse.json(banner));
  } catch (error) {
    console.error('Failed to update banner:', error);
    return corsError('Failed to update banner');
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = context.params.id;
    if (!id) {
      return NextResponse.json({ error: 'Invalid banner ID' }, { status: 400 });
    }

    await prisma.banner.delete({
      where: { id }
    });

    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Failed to delete banner:', error);
    return corsError('Failed to delete banner');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
