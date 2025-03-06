import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import { z } from 'zod';

const successStorySchema = z.object({
  title: z.string().min(3).max(255).optional(),
  content: z.any().optional(), // Allow any JSON, but consider a more specific schema
  personName: z.string().min(3).max(255).optional(),
  location: z.string().min(3).max(255).optional(),
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
    const { slug } = context.params;

    const story = await prisma.successStory.findUnique({
      where: { slug: slug },
    });

    if (!story) {
      return corsError('Success story not found', 404, request);
    }

    return withCors(NextResponse.json(story), request);
  } catch (error) {
    console.error(`Error fetching success story with slug ${context.params.slug}:`, error);
    return corsError('Failed to fetch success story', 500, request);
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = context.params;
    const data = await request.json();
    const validatedData = successStorySchema.partial().parse(data); // Partial validation

    // Fetch the story first to check if it exists
    const existingStory = await prisma.successStory.findUnique({
      where: { slug: slug },
    });

    if (!existingStory) {
      return corsError('Success story not found', 404, request);
    }

    const story = await prisma.successStory.update({
      where: { id: existingStory.id }, // Use the ID for update
      data: validatedData,
    });

    return withCors(NextResponse.json(story), request);
  } catch (error) {
    console.error(`Failed to update success story with slug ${context.params.slug}:`, error);
    return corsError('Failed to update success story', 500, request);
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = context.params;

    // Fetch the story first to check if it exists
    const existingStory = await prisma.successStory.findUnique({
      where: { slug: slug },
    });

    if (!existingStory) {
      return corsError('Success story not found', 404, request);
    }

    await prisma.successStory.delete({
      where: { id: existingStory.id }, // Use the ID for deletion
    });

    return withCors(NextResponse.json({ message: 'Success story deleted' }, request), request);
  } catch (error) {
    console.error(`Failed to delete success story with slug ${context.params.slug}:`, error);
    return corsError('Failed to delete success story', 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 200 }), request);
}