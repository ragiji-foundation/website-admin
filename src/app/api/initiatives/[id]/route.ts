import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileFromInput } from '@/lib/minio';
import { withCors, corsError } from '@/utils/cors';
import { validateFile } from '@/utils/fileValidation';



export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid initiative ID' }, { status: 400 });
    }

    const initiative = await prisma.initiative.findUnique({
      where: { id }
    });

    if (!initiative) {
      return NextResponse.json({ error: 'Initiative not found' }, { status: 404 });
    }

    return withCors(NextResponse.json(initiative));
  } catch (error) {
    console.error('Failed to fetch initiative:', error);
    return corsError('Failed to fetch initiative');
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid initiative ID' }, { status: 400 });
    }

    const existingInitiative = await prisma.initiative.findUnique({
      where: { id }
    });

    if (!existingInitiative) {
      return NextResponse.json({ error: 'Initiative not found' }, { status: 404 });
    }

    // Check if request contains FormData (file upload) or JSON
    const contentType = request.headers.get('content-type') || '';
    
    let title: string;
    let titleHi: string;
    let description: string;
    let descriptionHi: string;
    let order: number;
    let imageUrl: string = existingInitiative.imageUrl || '';
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await request.formData();
      
      title = formData.get('title') as string;
      titleHi = formData.get('titleHi') as string || existingInitiative.titleHi || '';
      description = formData.get('description') as string;
      descriptionHi = formData.get('descriptionHi') as string || existingInitiative.descriptionHi || '';
      order = parseInt(formData.get('order') as string) || existingInitiative.order;
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
      titleHi = body.titleHi || existingInitiative.titleHi || '';
      description = body.description;
      descriptionHi = body.descriptionHi || existingInitiative.descriptionHi || '';
      order = body.order || existingInitiative.order;
      imageUrl = body.imageUrl || existingInitiative.imageUrl || '';
    }

    // Basic validation
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
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

    const updateData = {
      title: title.trim(),
      titleHi: titleHi.trim(),
      description: description.trim(),
      descriptionHi: descriptionHi.trim(),
      imageUrl,
      order,
      updatedAt: new Date()
    };

    const updatedInitiative = await prisma.initiative.update({
      where: { id },
      data: updateData
    });

    const transformedInitiative = {
      id: updatedInitiative.id,
      title: updatedInitiative.title,
      titleHi: updatedInitiative.titleHi,
      description: updatedInitiative.description,
      descriptionHi: updatedInitiative.descriptionHi,
      imageUrl: updatedInitiative.imageUrl,
      order: updatedInitiative.order,
      createdAt: updatedInitiative.createdAt,
      updatedAt: updatedInitiative.updatedAt
    };

    return withCors(NextResponse.json(transformedInitiative));
  } catch (error) {
    console.error('Failed to update initiative:', error);
    return corsError('Failed to update initiative');
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid initiative ID' }, { status: 400 });
    }

    await prisma.initiative.delete({
      where: { id }
    });

    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Failed to delete initiative:', error);
    return corsError('Failed to delete initiative');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}