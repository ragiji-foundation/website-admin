import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { put, del } from '@vercel/blob';
import type { Carousel, CarouselUpdateInput } from '@/types/carousel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Wrap params in a Promise
): Promise<NextResponse<Carousel | { error: string }>> {
  try {
    const { id } = await params; // Resolve the params promise
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: 'Invalid carousel item ID' },
        { status: 400 }
      );
    }

    const item = await prisma.carousel.findUnique({
      where: { id: parsedId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Carousel item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error('Error fetching carousel:', err);
    return NextResponse.json(
      { error: 'Failed to fetch carousel item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Wrap params in a Promise
): Promise<NextResponse<Carousel | { error: string }>> {
  try {
    const { id } = await params; // Resolve the params promise
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: 'Invalid carousel item ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const updateData: CarouselUpdateInput = {};

    // Handle text fields
    if (formData.has('title')) updateData.title = formData.get('title') as string;
    if (formData.has('link')) updateData.link = formData.get('link') as string;
    if (formData.has('active')) updateData.active = formData.get('active') === 'true';
    if (formData.has('order')) updateData.order = parseInt(formData.get('order') as string);

    // Handle image upload if provided
    const image = formData.get('image') as File | null;
    if (image) {
      const blob = await put(image.name, image, {
        access: 'public',
      });
      updateData.imageUrl = blob.url;

      // Delete old image if it exists
      const oldItem = await prisma.carousel.findUnique({
        where: { id: parsedId },
        select: { imageUrl: true },
      });

      if (oldItem?.imageUrl) {
        try {
          const oldUrl = new URL(oldItem.imageUrl);
          await del(oldUrl.pathname);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }
    }

    const updatedItem = await prisma.carousel.update({
      where: { id: parsedId },
      data: updateData,
    });

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
  { params }: { params: Promise<{ id: string }> } // Wrap params in a Promise
): Promise<NextResponse<{ success: boolean; message: string } | { error: string }>> {
  try {
    const { id } = await params; // Resolve the params promise
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: 'Invalid carousel item ID' },
        { status: 400 }
      );
    }

    // Get the item first to get the image URL
    const item = await prisma.carousel.findUnique({
      where: { id: parsedId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Carousel item not found' },
        { status: 404 }
      );
    }

    // Delete the image from blob storage
    if (item.imageUrl) {
      try {
        const imageUrl = new URL(item.imageUrl);
        await del(imageUrl.pathname);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    // Delete from database
    await prisma.carousel.delete({
      where: { id: parsedId },
    });

    return NextResponse.json({
      success: true,
      message: 'Carousel item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to delete carousel item' },
      { status: 500 }
    );
  }
}