import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhyetvc2r',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('backgroundImage') as File;
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Direct upload to Cloudinary using the SDK
    let imageUrl = '';
    if (file) {
      try {
        // Convert the file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a data URI
        const base64Data = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64Data}`;

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            dataURI,
            {
              folder: 'banners',
              upload_preset: 'ragiji',
              resource_type: 'auto'
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
                return;
              }
              resolve(result);
            }
          );
        });

        imageUrl = (result as any).secure_url;
        console.log('Banner image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('Error uploading banner image:', uploadError);
        throw new Error('Failed to upload banner image');
      }
    }

    const banner = await prisma.banner.create({
      data: {
        type,
        title,
        description,
        backgroundImage: imageUrl,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create banner' },
      { status: 500 }
    );
  }
}
