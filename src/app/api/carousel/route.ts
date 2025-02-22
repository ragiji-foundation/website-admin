import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';
import type { Carousel, CarouselCreateInput } from '@/types/carousel';

export async function GET(
  request: NextRequest
): Promise<NextResponse<Carousel[] | { error: string }>> {
  try {
    const items = await prisma.carousel.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel items' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<Carousel | { error: string }>> {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const link = formData.get('link') as string;
    const active = formData.get('active') === 'true';
    const image = formData.get('image') as File;

    if (!title || !image) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    // Get max order value
    const maxOrder = await prisma.carousel.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    
    const nextOrder = (maxOrder?.order ?? -1) + 1;

    // Upload image to blob storage
    const blob = await put(image.name, image, {
      access: 'public',
    });

    const createData: CarouselCreateInput = {
      title,
      imageUrl: blob.url,
      link: link || '#',
      active,
      order: nextOrder,
    };

    // Create carousel item
    const carouselItem = await prisma.carousel.create({
      data: createData,
    });

    return NextResponse.json(carouselItem, { status: 201 });
  } catch (error) {
    console.error('Error creating carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to create carousel item' },
      { status: 500 }
    );
  }
}