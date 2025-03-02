import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (request.method === 'OPTIONS') {
    return corsError('CORS error', 400);
  }

  try {
    const id = parseInt(params.id);
    const career = await prisma.career.findUnique({
      where: { id }
    });

    if (!career) {
      return withCors(
        NextResponse.json(
          { error: 'Career not found' },
          { status: 404 }
        )
      );
    }

    return withCors(NextResponse.json(career));
  } catch (error) {
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch career' },
        { status: 500 }
      )
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const career = await prisma.career.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        location: data.location,
        type: data.type,
        description: data.description,
        requirements: data.requirements,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(career);
  } catch (error) {
    console.error('Error updating career:', error);
    return NextResponse.json(
      { error: 'Failed to update career' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.career.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting career:', error);
    return NextResponse.json(
      { error: 'Failed to delete career' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}