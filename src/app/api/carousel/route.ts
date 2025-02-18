import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const items = await prisma.carousel.findMany({
      where: { active: true },
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const link = formData.get('link') as string;
    const image = formData.get('image') as File;
    const order = parseInt(formData.get('order') as string || '0');

    if (!title || !image) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    // Upload image
    const blob = await put(image.name, image, {
      access: 'public',
    });

    // Create carousel item
    const carouselItem = await prisma.carousel.create({
      data: {
        title,
        imageUrl: blob.url,
        link: link || '#',
        order,
      },
    });

    revalidatePath('/api/carousel');

    return NextResponse.json(carouselItem, { status: 201 });
  } catch (error) {
    console.error('Error creating carousel item:', error);
    return NextResponse.json(
      { error: 'Failed to create carousel item' },
      { status: 500 }
    );
  }
}
