import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

// Fixed admin user ID for all blog operations
const DEFAULT_ADMIN_USER_ID = 1; // Use an ID that exists in your database

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

    // Create the blog post with fixed admin user
    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        content: data.content,
        status: data.status || 'draft',
        locale: data.locale,
        slug: slug,
        metaDescription: data.metaDescription || '',
        ogTitle: data.ogTitle || '',
        ogDescription: data.ogDescription || '',
        authorName: data.authorName || 'Admin',
        authorId: DEFAULT_ADMIN_USER_ID, // Use fixed admin user ID
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

    // Check if it's a foreign key constraint error related to the user ID
    if (error instanceof Error &&
      error.message.includes('foreign key constraint') &&
      error.message.includes('authorId')) {
      return NextResponse.json(
        { error: 'Admin user not found. Please create a user with ID 1 before creating blogs.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}