import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const gallery = await prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return withCors(NextResponse.json(gallery));
  } catch (error) {
    return corsError('Failed to fetch gallery');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { title, imageUrl } = body;
    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for unsupported fields and remove them
    const validFields = {
      title,
      imageUrl,
      category: body.category || 'general',
      description: body.description || '',
      // Note: metadata field is removed since it's not in the schema
    };

    // Create new gallery item with only valid fields
    const galleryItem = await prisma.gallery.create({
      data: validFields
    });

    // You can store the publicId in the response if needed
    const responseData = {
      ...galleryItem,
      publicId: body.publicId || null
    };

    return NextResponse.json({
      success: true,
      data: responseData
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}