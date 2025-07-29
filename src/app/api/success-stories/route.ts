import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import { z } from 'zod';

const successStorySchema = z.object({
  title: z.string().min(3).max(255),
  content: z.union([z.string(), z.record(z.any())]).transform(val => 
    typeof val === 'string' ? val : JSON.stringify(val)
  ), // Accept both string and object, convert object to string
  personName: z.string().min(3).max(255),
  location: z.string().min(3).max(255),
  imageUrl: z.string().optional(), // Remove .url() validation to accept MinIO proxy URLs
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  slug: z.string().min(3).max(255),
  titleHi: z.string().min(3).max(255).optional(),
  contentHi: z.union([z.string(), z.record(z.any())]).transform(val => 
    typeof val === 'string' ? val : JSON.stringify(val)
  ).optional(), // Accept both string and object, convert object to string
  personNameHi: z.string().min(3).max(255).optional(),
  locationHi: z.string().min(3).max(255).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const stories = await prisma.successStory.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        titleHi: true,
        content: true,
        contentHi: true,
        personName: true,
        personNameHi: true,
        location: true,
        locationHi: true,
        imageUrl: true,
        featured: true,
        order: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const transformedStories = stories.map(story => ({
      ...story,
      slug: story.slug || story.id, // Use slug if available, fallback to id
      titleHi: story.titleHi ?? '',
      contentHi: story.contentHi ?? '',
      personNameHi: story.personNameHi ?? '',
      locationHi: story.locationHi ?? '',
      imageUrl: story.imageUrl ?? ''
    }));

    return withCors(NextResponse.json(transformedStories));
  } catch (error) {
    console.error('Failed to fetch success stories:', error);
    return corsError('Failed to fetch success stories', 500);
  }
}

type SuccessStoryInput = z.infer<typeof successStorySchema>;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const validatedData = successStorySchema.parse(data);
    
    const createData = {
      title: validatedData.title,
      titleHi: validatedData.titleHi || '',
      content: validatedData.content,
      contentHi: validatedData.contentHi || '',
      personName: validatedData.personName,
      personNameHi: validatedData.personNameHi || '',
      location: validatedData.location,
      locationHi: validatedData.locationHi || '',
      imageUrl: validatedData.imageUrl || '',
      featured: validatedData.featured ?? false,
      order: validatedData.order || 0,
      slug: validatedData.slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const story = await prisma.successStory.create({
      data: createData
    });
    
    const transformedStory = {
      id: story.id,
      title: story.title,
      titleHi: story.titleHi,
      content: story.content,
      contentHi: story.contentHi,
      personName: story.personName,
      personNameHi: story.personNameHi,
      location: story.location,
      locationHi: story.locationHi,
      imageUrl: story.imageUrl,
      featured: story.featured,
      order: story.order,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt
    };
    
    return withCors(NextResponse.json(transformedStory, { status: 201 }));
  } catch (error: any) {
    console.error('Failed to create success story:', error);
    if (error instanceof z.ZodError) {
      return corsError('Validation error: ' + error.errors[0].message, 400);
    }
    return corsError('Failed to create success story', 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 200 }));
}