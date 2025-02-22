import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import prisma from '@/lib/prisma';

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
    const id = Number(context.params.id);
    
    // Get the gallery item
    const item = await prisma.gallery.findUnique({
      where: { id }
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
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      });

      await s3.send(deleteCommand);
    }

    // Delete from database
    await prisma.gallery.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Gallery item deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}