import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import { z } from 'zod';

const successStorySchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(1, { message: "Content is required" }), // Make content required and ensure it's a string
  personName: z.string().min(3).max(255),
  location: z.string().min(3).max(255),
  imageUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  slug: z.string().min(3).max(255)
});

export async function GET(request: NextRequest) {
  try {
    const stories = await prisma.successStory.findMany({
      orderBy: { order: 'asc' } // Use `order` field for sorting
    });

    return withCors(NextResponse.json(stories), request);
  } catch (error) {
    console.error('Failed to fetch success stories:', error);
    return corsError('Failed to fetch success stories', 500, request);
  }
}

type SuccessStoryInput = z.infer<typeof successStorySchema>;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const validatedData = successStorySchema.parse(data);
    
    const story = await prisma.successStory.create({
      data: validatedData as SuccessStoryInput
    });
    
    return withCors(NextResponse.json(story, { status: 201 }), request);
  } catch (error: any) {
    console.error('Failed to create success story:', error);
    if (error instanceof z.ZodError) {
      return corsError('Validation error: ' + error.errors[0].message, 400, request);
    }
    return corsError('Failed to create success story', 500, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 200 }), request);
}