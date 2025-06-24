import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = parseInt(context.params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Testimonial deleted successfully' }
    );
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
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
    const id = parseInt(context.params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    const updateData = {
      name: body.name,
      nameHi: body.nameHi || existingTestimonial.nameHi || '',
      role: body.role,
      roleHi: body.roleHi || existingTestimonial.roleHi || '',
      content: body.content,
      contentHi: body.contentHi || existingTestimonial.contentHi || '',
      avatar: body.avatar || existingTestimonial.avatar,
      isPublished: body.isPublished ?? existingTestimonial.isPublished,
      createdAt: existingTestimonial.createdAt
    };

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    const transformedTestimonial = {
      id: updatedTestimonial.id,
      name: updatedTestimonial.name,
      nameHi: updatedTestimonial.nameHi,
      role: updatedTestimonial.role,
      roleHi: updatedTestimonial.roleHi,
      content: updatedTestimonial.content,
      contentHi: updatedTestimonial.contentHi,
      avatar: updatedTestimonial.avatar,
      isPublished: updatedTestimonial.isPublished,
      createdAt: updatedTestimonial.createdAt
    };

    return NextResponse.json(transformedTestimonial);
  } catch (err) {
    console.error('Error updating testimonial:', err);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}