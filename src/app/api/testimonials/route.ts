import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: { isPublished: true }
    });

    return withCors(NextResponse.json(testimonials));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return corsError('Failed to fetch testimonials');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim() || !body.role?.trim() || !body.content?.trim()) {
      return withCors(
        NextResponse.json(
          { error: 'Name, role, and content are required' },
          { status: 400 }
        )
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name.trim(),
        role: body.role.trim(),
        content: body.content.trim(),
        avatar: body.avatar?.trim() || null,
        isPublished: true
      },
    });

    return withCors(NextResponse.json(testimonial, { status: 201 }));
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return corsError('Failed to create testimonial');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

// Helper function to validate image URLs
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(parsedUrl.pathname);
  } catch {
    return false;
  }
}