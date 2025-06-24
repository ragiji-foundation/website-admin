import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

// GET a specific feature
export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    // Access id through context.params, which is already resolved
    const id = context.params.id;

    const feature = await prisma.feature.findUnique({
      where: { id }
    });

    if (!feature) {
      return corsError('Feature not found', 404);
    }

    // Transform the database model to match our API format
    const transformedFeature = {
      id: feature.id,
      title: feature.title,
      description: feature.description,
      slug: feature.mediaType, // Using mediaType field as slug
      category: feature.section, // Using section field as category
      order: feature.order,
      mediaItem: {
        type: feature.mediaType,
        url: feature.mediaUrl,
        thumbnail: feature.thumbnail || undefined
      },
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt
    };

    return withCors(NextResponse.json(transformedFeature));
  } catch (error) {
    console.error(`Error fetching feature:`, error);
    return corsError('Failed to fetch feature', 500);
  }
}

// UPDATE a feature
export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    // Access id through context.params, which is already resolved
    const id = context.params.id;
    const body = await request.json();

    // Check if feature exists
    const existingFeature = await prisma.feature.findUnique({
      where: { id }
    });

    if (!existingFeature) {
      return corsError('Feature not found', 404);
    }

    // Transform the API format to match the database schema
    const updateData = {
      title: body.title,
      titleHi: body.titleHi || existingFeature.titleHi || '',
      description: body.description,
      descriptionHi: body.descriptionHi || existingFeature.descriptionHi || '',
      mediaType: body.mediaItem?.type || existingFeature.mediaType, // Use mediaItem.type as mediaType
      mediaUrl: body.mediaItem?.url || existingFeature.mediaUrl,   // Use mediaItem.url as mediaUrl
      thumbnail: body.mediaItem?.thumbnail || existingFeature.thumbnail, // Use mediaItem.thumbnail
      section: body.category || existingFeature.section,   // Use category as section
      order: body.order || existingFeature.order,
      updatedAt: new Date()
    };

    // Update the feature
    const updatedFeature = await prisma.feature.update({
      where: { id },
      data: updateData
    });

    // Transform back to API format
    const transformedFeature = {
      id: updatedFeature.id,
      title: updatedFeature.title,
      titleHi: updatedFeature.titleHi,
      description: updatedFeature.description,
      descriptionHi: updatedFeature.descriptionHi,
      slug: updatedFeature.mediaType,
      category: updatedFeature.section,
      order: updatedFeature.order,
      mediaItem: {
        type: updatedFeature.mediaType,
        url: updatedFeature.mediaUrl,
        thumbnail: updatedFeature.thumbnail || undefined
      },
      createdAt: updatedFeature.createdAt,
      updatedAt: updatedFeature.updatedAt
    };

    return withCors(NextResponse.json(transformedFeature));
  } catch (error) {
    console.error(`Error updating feature:`, error);
    return corsError('Failed to update feature', 500);
  }
}

// DELETE a feature
export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    // Access id through context.params, which is already resolved
    const id = context.params.id;

    // Check if feature exists
    const existingFeature = await prisma.feature.findUnique({
      where: { id }
    });

    if (!existingFeature) {
      return corsError('Feature not found', 404);
    }

    // Delete the feature
    await prisma.feature.delete({
      where: { id }
    });

    return withCors(NextResponse.json({ message: 'Feature deleted' }));
  } catch (error) {
    console.error(`Error deleting feature:`, error);
    return corsError('Failed to delete feature', 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 200 }));
}