import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: { isPublished: true }
    });

    const transformedTestimonials = testimonials.map(testimonial => ({
      id: testimonial.id,
      name: locale === 'hi' && testimonial.nameHi ? testimonial.nameHi : testimonial.name,
      nameHi: testimonial.nameHi,
      role: locale === 'hi' && testimonial.roleHi ? testimonial.roleHi : testimonial.role,
      roleHi: testimonial.roleHi,
      content: locale === 'hi' && testimonial.contentHi ? testimonial.contentHi : testimonial.content,
      contentHi: testimonial.contentHi,
      avatar: testimonial.avatar,
      isPublished: testimonial.isPublished,
      createdAt: testimonial.createdAt
    }));

    return withCors(NextResponse.json(transformedTestimonials));
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

    const createData = {
      name: body.name,
      nameHi: body.nameHi || '',
      role: body.role,
      roleHi: body.roleHi || '',
      content: body.content,
      contentHi: body.contentHi || '',
      avatar: body.avatar || '',
      isPublished: body.isPublished ?? false,
      createdAt: new Date()
    };

    const testimonial = await prisma.testimonial.create({
      data: createData,
    });

    const transformedTestimonial = {
      id: testimonial.id,
      name: testimonial.name,
      nameHi: testimonial.nameHi,
      role: testimonial.role,
      roleHi: testimonial.roleHi,
      content: testimonial.content,
      contentHi: testimonial.contentHi,
      avatar: testimonial.avatar,
      isPublished: testimonial.isPublished,
      createdAt: testimonial.createdAt
    };

    return withCors(NextResponse.json(transformedTestimonial, { status: 201 }));
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