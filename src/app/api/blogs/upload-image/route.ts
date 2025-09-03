import { NextRequest, NextResponse } from 'next/server';
import { uploadToMinio } from '@/utils/minioUpload';

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed' },
        { status: 400 }
      );
    }

    // Upload with optimized settings
    const result = await uploadToMinio(file, { 
      folder: 'blogs',
      resourceType: 'image',
      tags: ['blog', 'content'],
      showNotifications: false
    });

    if (!result || !result.url) {
      throw new Error('Upload failed: No URL returned');
    }

    // Return optimized response
    return NextResponse.json({
      url: result.url,
      success: true,
      publicId: result.publicId,
      size: file.size,
      type: file.type,
      format: result.format
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json(
      { error: message, success: false },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': 'www.ragijifoundation.com,ragijifoundation.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    status: 200
  });
}
