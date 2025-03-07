import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPublicIdFromUrl } from '@/utils/cloudinary';

// Validate environment variables
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    // Await params before accessing
    const { id } = await context.params;

    // Validate ID format
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid gallery item ID' },
        { status: 400 }
      );
    }

    // Convert id to number for database query
    const galleryId = Number(id);

    // Get the gallery item
    const item = await prisma.gallery.findUnique({
      where: { id: galleryId }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // If using Cloudinary, extract the publicId for logging
    const publicId = getPublicIdFromUrl(item.imageUrl);
    if (publicId) {
      console.log(`Item to delete from Cloudinary: ${publicId}`);
      // Note: We're just logging, not deleting from Cloudinary
      // Cloudinary has automatic cleanup policies or you can add SDK calls here
    }

    // Delete from database
    await prisma.gallery.delete({
      where: { id: galleryId }
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the gallery item' },
      { status: 500 }
    );
  }
}