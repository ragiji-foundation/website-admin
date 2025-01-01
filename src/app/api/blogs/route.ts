import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';
import { isApiError } from '@/types/api';

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

    const where = {
      locale,
      ...(status && { status }),
      ...(category && { category: { slug: category } }),
    };

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
    ]).catch((error) => {
      console.error('Database error:', error);
      throw new Error('Failed to fetch blogs');
    });

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
    console.error('Error in GET /api/blogs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content || !data.locale) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = slugify(data.title, { lower: true, strict: true });

    // Check if slug exists and append number if needed
    const existingBlog = await prisma.blog.findFirst({
      where: {
        slug,
        locale: data.locale,
      },
    });

    if (existingBlog) {
      const count = await prisma.blog.count({
        where: {
          slug: {
            startsWith: slug,
          },
          locale: data.locale,
        },
      });
      slug = `${slug}-${count + 1}`;
    }

    // Create the blog post with proper types and fixed authorId
    const blog = await prisma.blog.create({
      data: {
        title: data.title as string,
        content: data.content as string,
        status: data.status as string || 'draft',
        locale: data.locale as string,
        slug: slug,
        metaDescription: data.metaDescription as string || '',
        ogTitle: data.ogTitle as string || '',
        ogDescription: data.ogDescription as string || '',
        authorName: 'Admin User', // Fixed author name
        authorId: 5, // Fixed authorId
        categoryId: data.categoryId ? parseInt(data.categoryId.toString()) : null,
        tags: data.tags ? {
          connect: data.tags.map((tag: { id: number }) => ({
            id: parseInt(tag.id.toString())
          }))
        } : undefined
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
} 