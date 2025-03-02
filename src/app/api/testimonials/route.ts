import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors } from '@/utils/cors';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        createdAt: 'desc',
      }
    });

    return withCors(NextResponse.json(testimonials));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch testimonials' },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim() || !body.role?.trim() || !body.content?.trim()) {
      return withCors(
        NextResponse.json(
          { error: 'Name, role, and content are required fields' },
          { status: 400 }
        )
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name.trim(),
        role: body.role.trim(),
        content: body.content.trim(),
        avatar: body.avatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}`,
      },
    });

    return withCors(NextResponse.json(testimonial, { status: 201 }));
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to create testimonial' },
        { status: 500 }
      )
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = parseInt(request.url.split('/').pop() || '0');

    if (!id) {
      return withCors(
        NextResponse.json(
          { error: 'Invalid testimonial ID' },
          { status: 400 }
        )
      );
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to delete testimonial' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}