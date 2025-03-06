import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/utils/cloudinary';

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

    // Upload the image to Cloudinary
    const result = await uploadToCloudinary(file, 'blogs');

    // Return the URL of the uploaded image
    return NextResponse.json({
      url: result.secure_url,
      success: true
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', success: false },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    status: 200
  });
}
