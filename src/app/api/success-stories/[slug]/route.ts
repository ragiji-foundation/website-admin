import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import { z } from 'zod';

const successStorySchema = z.object({
  title: z.string().min(3).max(255).optional(),
  titleHi: z.string().min(3).max(255).optional(),
  content: z.any().optional(), // Allow any JSON, but consider a more specific schema
  contentHi: z.any().optional(),
  personName: z.string().min(3).max(255).optional(),
  personNameHi: z.string().min(3).max(255).optional(),
  location: z.string().min(3).max(255).optional(),
  locationHi: z.string().min(3).max(255).optional(),
  imageUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  slug: z.string().min(3).max(255).optional()
});

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = await context.params;

    const story = await prisma.successStory.findUnique({
      where: { slug: slug },
    });

    if (!story) {
      return corsError('Success story not found', 404);
    }

    return withCors(NextResponse.json(story));
  } catch (error) {
    console.error(`Error fetching success story with slug ${context.params.slug}:`, error);
    return corsError('Failed to fetch success story', 500);
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = await context.params;
    const data = await request.json();
    const validatedData = successStorySchema.partial().parse(data); // Partial validation

    // Fetch the story first to check if it exists
    const existingStory = await prisma.successStory.findUnique({
      where: { slug: slug },
    });

    if (!existingStory) {
      return corsError('Success story not found', 404);
    }

    const updateData = {
      title: validatedData.title || existingStory.title,
      titleHi: validatedData.titleHi || existingStory.titleHi || '',
      content: validatedData.content || existingStory.content,
      contentHi: validatedData.contentHi || existingStory.contentHi || '',
      personName: validatedData.personName || existingStory.personName,
      personNameHi: validatedData.personNameHi || existingStory.personNameHi || '',
      location: validatedData.location || existingStory.location,
      locationHi: validatedData.locationHi || existingStory.locationHi || '',
      imageUrl: validatedData.imageUrl || existingStory.imageUrl,
      featured: validatedData.featured ?? existingStory.featured,
      order: validatedData.order || existingStory.order,
      updatedAt: new Date()
    };

    const updatedStory = await prisma.successStory.update({
      where: { id: existingStory.id }, // Use the ID for update
      data: updateData,
    });

    const transformedStory = {
      id: updatedStory.id,
      title: updatedStory.title,
      titleHi: updatedStory.titleHi,
      content: updatedStory.content,
      contentHi: updatedStory.contentHi,
      personName: updatedStory.personName,
      personNameHi: updatedStory.personNameHi,
      location: updatedStory.location,
      locationHi: updatedStory.locationHi,
      imageUrl: updatedStory.imageUrl,
      featured: updatedStory.featured,
      order: updatedStory.order,
      createdAt: updatedStory.createdAt,
      updatedAt: updatedStory.updatedAt
    };

    return withCors(NextResponse.json(transformedStory));
  } catch (error) {
    console.error(`Failed to update success story with slug ${context.params.slug}:`, error);
    return corsError('Failed to update success story', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = await context.params;

    // Fetch the story first to check if it exists
    const existingStory = await prisma.successStory.findUnique({
      where: { slug: slug },
    });

    if (!existingStory) {
      return corsError('Success story not found', 404);
    }

    await prisma.successStory.delete({
      where: { id: existingStory.id }, // Use the ID for deletion
    });

    return withCors(NextResponse.json({ message: 'Success story deleted successfully' }));
  } catch (error) {
    console.error(`Failed to delete success story with slug ${context.params.slug}:`, error);
    return corsError('Failed to delete success story', 500);
  }
}

export async function OPTIONS(_request: NextRequest) {
  return withCors(new NextResponse(null, { status: 200 }));
}