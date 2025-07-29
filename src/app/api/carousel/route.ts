import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileFromInput } from '@/lib/minio';
import type { Carousel, CarouselCreateInput } from '@/types/carousel';
import { withCors, corsError } from '@/utils/cors';
import { validateFile } from '@/utils/fileValidation';

export async function GET(
  _request: NextRequest
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
    const titleHi = formData.get('titleHi') as string | null;
    const link = formData.get('link') as string;
    const type = formData.get('type') as 'image' | 'video';
    const active = formData.get('active') === 'true';
    const image = formData.get('image') as File | null;
    const video = formData.get('video') as File | null;

    // Enhanced validation
    if (!title?.trim()) {
      return corsError('Title is required', 400);
    }

    if (!type || (type !== 'image' && type !== 'video')) {
      return corsError('Valid type (image or video) is required', 400);
    }

    if (type === 'image') {
      const imageValidation = validateFile(image, { type: 'image', maxSizeMB: 10 });
      if (!imageValidation.valid) {
        return corsError(imageValidation.error || 'Invalid image file', 400);
      }
    }

    if (type === 'video') {
      const videoValidation = validateFile(video, { type: 'video', maxSizeMB: 50 });
      if (!videoValidation.valid) {
        return corsError(videoValidation.error || 'Invalid video file', 400);
      }
    }

    // Get max order value
    const maxOrder = await prisma.carousel.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const nextOrder = (maxOrder?.order ?? -1) + 1;

    let imageUrl: string | undefined = undefined;
    let videoUrl: string | undefined = undefined;

    try {
      if (type === 'image' && image) {
        const result = await uploadFileFromInput(image, {
          folder: 'carousel',
          tags: ['carousel', 'image'],
        });
        imageUrl = result.url;
      } else if (type === 'video' && video) {
        const result = await uploadFileFromInput(video, {
          folder: 'carousel',
          tags: ['carousel', 'video'],
        });
        videoUrl = result.url;
      }
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return corsError('Failed to upload media file', 500);
    }

    const createData: CarouselCreateInput = {
      title: title.trim(),
      titleHi: titleHi?.trim() || '',
      type,
      imageUrl,
      videoUrl,
      link: link?.trim() || '#',
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