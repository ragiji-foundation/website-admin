import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      testimonials,
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.role || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role,
        content: body.content,
        avatar: body.avatar || null,
      },
    });

    return NextResponse.json(
      testimonial,
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
} 