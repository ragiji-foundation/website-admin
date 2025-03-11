import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';
import type { Carousel, CarouselCreateInput } from '@/types/carousel';
import { withCors, corsError } from '@/utils/cors';

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

    // Fix by explicitly typing the response
    const response = NextResponse.json(items);
    return withCors(response) as NextResponse<Carousel[]>;
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    return corsError('Failed to fetch carousel items', 500) as NextResponse<{ error: string }>;
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<Carousel | { error: string }>> {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const link = formData.get('link') as string;
    const type = formData.get('type') as 'image' | 'video';
    const active = formData.get('active') === 'true';
    const image = formData.get('image') as File;
    const video = formData.get('video') as File;

    if (!title || (!image && !video)) {
      return corsError('Title and media file are required', 400);
    }

    // Get max order value
    const maxOrder = await prisma.carousel.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const nextOrder = (maxOrder?.order ?? -1) + 1;

    let imageUrl: string | undefined = undefined;
    let videoUrl: string | undefined = undefined;

    if (type === 'image' && image) {
      const blob = await put(image.name, image, {
        access: 'public',
      });
      imageUrl = blob.url;
    } else if (type === 'video' && video) {
      const blob = await put(video.name, video, {
        access: 'public',
      });
      videoUrl = blob.url;
    }

    const createData: CarouselCreateInput = {
      title,
      type,
      imageUrl,
      videoUrl,
      link: link || '#',
      active,
      order: nextOrder,
    };

    const carouselItem = await prisma.carousel.create({
      data: createData,
    });

    const response = NextResponse.json(carouselItem, { status: 201 });
    return withCors(response) as NextResponse<Carousel>;
  } catch (error) {
    console.error('Error creating carousel item:', error);
    return corsError('Failed to create carousel item', 500) as NextResponse<{ error: string }>;
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}