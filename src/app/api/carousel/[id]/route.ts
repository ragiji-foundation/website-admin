import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadFileFromInput, deleteFile, getBucketForFileType, minioClient } from '@/lib/minio';
import type { Carousel, CarouselUpdateInput, CarouselType } from '@/types/carousel';

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

    // Cast to Carousel or add the missing type property
    const carouselItem = {
      ...item,
      titleHi: item.titleHi ?? undefined,
      type: 'default' as CarouselType // Set a default type or fetch from DB if available
    };

    return NextResponse.json(carouselItem);
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

    const contentType = request.headers.get('content-type') || '';
    const updateData: CarouselUpdateInput = {};

    if (contentType.includes('application/json')) {
      // Handle JSON requests (for simple updates like status, order)
      const body = await request.json();
      
      if (body.title !== undefined) updateData.title = body.title;
      if (body.titleHi !== undefined) updateData.titleHi = body.titleHi;
      if (body.link !== undefined) updateData.link = body.link;
      if (body.active !== undefined) updateData.active = body.active;
      if (body.order !== undefined) updateData.order = body.order;
      
    } else {
      // Handle FormData requests (for file uploads)
      const formData = await request.formData();

      // Handle text fields
      if (formData.has('title')) updateData.title = formData.get('title') as string;
      if (formData.has('titleHi')) updateData.titleHi = formData.get('titleHi') as string;
      if (formData.has('link')) updateData.link = formData.get('link') as string;
      if (formData.has('active')) updateData.active = formData.get('active') === 'true';
      if (formData.has('order')) updateData.order = parseInt(formData.get('order') as string);

      // Handle image upload if provided
      const image = formData.get('image') as File | null;
      if (image) {
        const result = await uploadFileFromInput(image, {
          folder: 'carousel',
          tags: ['carousel'],
        });
        updateData.imageUrl = result.url;

        // Delete old image if it exists
        const oldItem = await prisma.carousel.findUnique({
          where: { id: parsedId },
          select: { imageUrl: true },
        });

        if (oldItem?.imageUrl) {
          try {
            const bucket = getBucketForFileType('image/jpeg'); // Default to image bucket
            const objectName = oldItem.imageUrl.split('/').pop() || '';
            await deleteFile(bucket, objectName);
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError);
          }
        }
      }
    }

    const updatedItem = await prisma.carousel.update({
      where: { id: parsedId },
      data: updateData,
    });

    // Add the type property to match the Carousel type
    const carouselItem = {
      ...updatedItem,
      titleHi: updatedItem.titleHi ?? undefined,
      type: 'default' as CarouselType // Set a default type or fetch from DB if available
    };

    return NextResponse.json(carouselItem);
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

    // Get the item first to get the media URLs
    const item = await prisma.carousel.findUnique({
      where: { id: parsedId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Carousel item not found' },
        { status: 404 }
      );
    }

    console.log('Deleting carousel item:', { id: parsedId, imageUrl: item.imageUrl, videoUrl: item.videoUrl });

    // Delete the image from MinIO storage
    if (item.imageUrl) {
      try {
        // Extract object name from proxy URL: /api/image-proxy/ragiji-images/filename.ext
        // Should become just: filename.ext (not ragiji-images/filename.ext)
        const urlParts = item.imageUrl.split('/api/image-proxy/');
        if (urlParts.length > 1) {
          const fullPath = decodeURIComponent(urlParts[1]);
          // Split by '/' and get the last part (the actual filename)
          const pathParts = fullPath.split('/');
          const objectName = pathParts[pathParts.length - 1]; // Just the filename
          const bucketName = pathParts[0]; // The bucket name
          
          console.log('Deleting image object:', objectName);
          console.log('From bucket:', bucketName);
          console.log('Full path was:', fullPath);
          
          // Verify the object exists before attempting deletion
          try {
            await minioClient.statObject(bucketName, objectName);
            console.log('Object exists in MinIO, proceeding with deletion');
          } catch (statError) {
            console.warn('Object does not exist in MinIO:', objectName);
            console.warn('Stat error:', statError);
          }
          
          await deleteFile(bucketName, objectName);
          console.log('Successfully deleted image from MinIO');
        } else {
          console.warn('Could not parse image URL for deletion:', item.imageUrl);
        }
      } catch (deleteError) {
        console.error('Error deleting image from MinIO:', deleteError);
        console.error('Delete error details:', {
          message: deleteError instanceof Error ? deleteError.message : 'Unknown error',
          stack: deleteError instanceof Error ? deleteError.stack : undefined,
          code: (deleteError as any)?.code || 'Unknown code'
        });
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete the video from MinIO storage
    if (item.videoUrl) {
      try {
        // Extract object name from proxy URL: /api/image-proxy/ragiji-videos/filename.ext
        // Should become just: filename.ext (not ragiji-videos/filename.ext)
        const urlParts = item.videoUrl.split('/api/image-proxy/');
        if (urlParts.length > 1) {
          const fullPath = decodeURIComponent(urlParts[1]);
          // Split by '/' and get the last part (the actual filename)
          const pathParts = fullPath.split('/');
          const objectName = pathParts[pathParts.length - 1]; // Just the filename
          const bucketName = pathParts[0]; // The bucket name
          
          console.log('Deleting video object:', objectName);
          console.log('From bucket:', bucketName);
          
          await deleteFile(bucketName, objectName);
          console.log('Successfully deleted video from MinIO');
        } else {
          console.warn('Could not parse video URL for deletion:', item.videoUrl);
        }
      } catch (deleteError) {
        console.error('Error deleting video from MinIO:', deleteError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.carousel.delete({
      where: { id: parsedId },
    });

    console.log('Successfully deleted carousel item from database');

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