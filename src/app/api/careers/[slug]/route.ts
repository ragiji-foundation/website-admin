import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const career = await prisma.career.findUnique({
      where: {
        slug: context.params.slug,
      }
    });

    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    return NextResponse.json(career);
  } catch (error) {
    console.error('Error fetching career:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.requirements) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const career = await prisma.career.update({
      where: {
        slug: context.params.slug,
      },
      data,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    await prisma.career.delete({
      where: {
        slug: context.params.slug,
      },
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
