import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const carouselId = parseInt(id);

    const item = await prisma.carousel.findUnique({
      where: { id: carouselId }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Carousel item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const carouselId = parseInt(id);
    const body = await request.json();

    const updatedItem = await prisma.carousel.update({
      where: { id: carouselId },
      data: {
        title: body.title,
        link: body.link,
        active: body.active,
        order: body.order,
      },
    });

    revalidatePath('/api/carousel');
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to update carousel item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const carouselId = parseInt(id);

    // Get the item first to get the image URL
    const item = await prisma.carousel.findUnique({
      where: { id: carouselId }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Carousel item not found' },
        { status: 404 }
      );
    }

    // Delete the image from blob storage
    try {
      const imageUrl = new URL(item.imageUrl);
      await del(imageUrl.pathname);
    } catch (deleteError) {
      console.error('Error deleting image:', deleteError);
    }

    // Delete from database
    await prisma.carousel.delete({
      where: { id: carouselId }
    });

    revalidatePath('/api/carousel');
    return NextResponse.json({
      success: true,
      message: 'Carousel item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to delete carousel item' },
      { status: 500 }
    );
  }
}
