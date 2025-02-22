import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import prisma from '@/lib/prisma';

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

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

    // Extract the key from the imageUrl
    const key = item.imageUrl.split('.amazonaws.com/')[1];

    // Delete from S3
    if (key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
        });

        await s3.send(deleteCommand);
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
        return NextResponse.json(
          { error: 'Failed to delete image from storage' },
          { status: 500 }
        );
      }
    }

    // Delete from database
    await prisma.gallery.delete({
      where: { id: galleryId }
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item and associated image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the gallery item' },
      { status: 500 }
    );
  }
}