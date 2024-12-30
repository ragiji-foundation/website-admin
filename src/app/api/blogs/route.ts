import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const logError = (error: unknown, context: string) => {
  if (error instanceof Error) {
    console.error(`${context}:`, {
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`${context}:`, error);
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build the where clause
    const where = {
      locale,
      ...(status && { status }),
      ...(category && {
        category: {
          slug: category
        }
      }),
    };

    // Get total count and blogs with proper relations
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          category: true,
          tags: true,
        },
      }),
      prisma.blog.count({ where }),
    ]);

    if (!blogs) {
      return NextResponse.json({
        blogs: [],
        pagination: {
          total: 0,
          pages: 0,
          page,
          limit,
        }
      });
    }

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    logError(error, 'Error fetching blogs');
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.locale) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        locale: body.locale,
        slug: body.slug,
        status: body.status || 'draft',
        category: body.category,
        metaDescription: body.metaDescription,
        ogTitle: body.ogTitle,
        ogDescription: body.ogDescription,
        authorId: body.authorId,
        tags: body.tags,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
} 