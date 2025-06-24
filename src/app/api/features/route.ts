import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import { generateId } from '@/utils/id';

// GET all features
export async function GET(request: NextRequest) {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { order: 'asc' }
    });

    // Transform database results to match our API schema
    const transformedFeatures = features.map((feature) => ({
      id: feature.id,
      title: feature.title,
      titleHi: feature.titleHi ?? '',
      description: feature.description,
      descriptionHi: feature.descriptionHi ?? '',
      slug: feature.mediaType, // Using mediaType field as slug
      category: feature.section, // Using section field as category
      order: feature.order,
      mediaItem: {
        type: feature.mediaType,
        url: feature.mediaUrl,
        thumbnail: feature.thumbnail || undefined
      },
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
      isPublished: true // Hardcoded since it's not in DB schema
    }));

    return withCors(NextResponse.json(transformedFeatures));
  } catch (error) {
    console.error('Error fetching features:', error);
    return corsError('Failed to fetch features', 500);
  }
}

// CREATE a new feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate a unique ID
    const id = generateId('feat');

    // Transform the API request to match database schema
    const createData = {
      id,
      title: body.title,
      titleHi: body.titleHi || '',
      description: body.description,
      descriptionHi: body.descriptionHi || '',
      mediaType: body.mediaItem?.type || 'image',
      mediaUrl: body.mediaItem?.url || '',
      thumbnail: body.mediaItem?.thumbnail || null,
      section: body.category || null,
      order: body.order || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create the feature
    const feature = await prisma.feature.create({
      data: createData
    });

    // Transform the result back to API format
    const transformedFeature = {
      id: feature.id,
      title: feature.title,
      titleHi: feature.titleHi,
      description: feature.description,
      descriptionHi: feature.descriptionHi,
      slug: feature.mediaType, // Using mediaType field as slug
      category: feature.section, // Using section field as category
      order: feature.order,
      mediaItem: {
        type: feature.mediaType,
        url: feature.mediaUrl,
        thumbnail: feature.thumbnail || undefined
      },
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
      isPublished: true // Hardcoded since it's not in DB schema
    };

    return withCors(NextResponse.json(transformedFeature, { status: 201 }));
  } catch (error) {
    console.error('Error creating feature:', error);
    return corsError('Failed to create feature', 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 200 }));
}
