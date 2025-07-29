import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileFromInput } from '@/lib/minio';
import { withCors, corsError } from '@/utils/cors';
import { validateFile } from '@/utils/fileValidation';
import type { Initiative } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const initiatives = await prisma.initiative.findMany({
      orderBy: { order: 'asc' }
    });

    const transformedInitiatives = initiatives.map((initiative: Initiative) => ({
      id: initiative.id,
      title: locale === 'hi' && initiative.titleHi ? initiative.titleHi : initiative.title,
      titleHi: initiative.titleHi,
      description: locale === 'hi' && initiative.descriptionHi ? initiative.descriptionHi : initiative.description,
      descriptionHi: initiative.descriptionHi,
      imageUrl: initiative.imageUrl,
      order: initiative.order,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt
    }));

    return withCors(NextResponse.json(transformedInitiatives));
  } catch (error) {
    console.error('Failed to fetch initiatives:', error);
    return corsError('Failed to fetch initiatives');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if request contains FormData (file upload) or JSON
    const contentType = request.headers.get('content-type') || '';
    
    let title: string;
    let titleHi: string;
    let description: string;
    let descriptionHi: string;
    let order: number;
    let imageUrl: string = '';
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await request.formData();
      
      title = formData.get('title') as string;
      titleHi = formData.get('titleHi') as string || '';
      description = formData.get('description') as string;
      descriptionHi = formData.get('descriptionHi') as string || '';
      order = parseInt(formData.get('order') as string) || 0;
      imageFile = formData.get('image') as File | null;
      
      // If no file but imageUrl is provided as fallback
      const providedImageUrl = formData.get('imageUrl') as string;
      if (providedImageUrl) {
        imageUrl = providedImageUrl;
      }
    } else {
      // Handle JSON for backwards compatibility
      const body = await request.json();
      title = body.title;
      titleHi = body.titleHi || '';
      description = body.description;
      descriptionHi = body.descriptionHi || '';
      order = body.order || 0;
      imageUrl = body.imageUrl || '';
    }

    // Validation
    if (!title?.trim()) {
      return corsError('Title is required', 400);
    }

    if (!description?.trim()) {
      return corsError('Description is required', 400);
    }

    // Handle file upload if provided
    if (imageFile) {
      const imageValidation = validateFile(imageFile, { type: 'image', maxSizeMB: 10 });
      if (!imageValidation.valid) {
        return corsError(imageValidation.error || 'Invalid image file', 400);
      }

      try {
        const result = await uploadFileFromInput(imageFile, {
          folder: 'initiatives',
          tags: ['initiatives', 'image'],
        });
        imageUrl = result.url;
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        return corsError('Failed to upload image file', 500);
      }
    }

    // Get max order if not provided
    if (order === 0) {
      const maxOrder = await prisma.initiative.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      order = (maxOrder?.order ?? -1) + 1;
    }

    const createData = {
      title: title.trim(),
      titleHi: titleHi.trim(),
      description: description.trim(),
      descriptionHi: descriptionHi.trim(),
      imageUrl,
      order,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const initiative = await prisma.initiative.create({ data: createData });

    const transformedInitiative = {
      id: initiative.id,
      title: initiative.title,
      titleHi: initiative.titleHi,
      description: initiative.description,
      descriptionHi: initiative.descriptionHi,
      imageUrl: initiative.imageUrl,
      order: initiative.order,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt
    };

    const response = NextResponse.json(transformedInitiative, { status: 201 });
    return withCors(response);
  } catch (error) {
    console.error('Failed to create initiative:', error);
    return corsError('Failed to create initiative', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}