import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';


export async function GET(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return corsError('CORS error');
  }

  try {
    const careers = await prisma.career.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return withCors(NextResponse.json(careers));
  } catch (error) {
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch careers' },
        { status: 500 }
      )
    );
  }
}

// Slug-based GET handler
export async function getCareerBySlug(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const career = await prisma.career.findUnique({
      where: { slug: params.slug }
    });

    if (!career) {
      return withCors(
        NextResponse.json(
          { error: 'Career not found' },
          { status: 404 }
        )
      );
    }

    return withCors(NextResponse.json(career));
  } catch (error) {
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch career' },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const career = await prisma.career.create({
      data: {
        title: data.title,
        location: data.location,
        type: data.type,
        description: data.description,
        requirements: data.requirements,
        isActive: true
      }
    });
    return withCors(NextResponse.json(career));
  } catch (error) {
    console.error('Error creating career:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to create career' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

