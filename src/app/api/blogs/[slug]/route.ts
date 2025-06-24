import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Fixed admin user ID for all blog operations
const DEFAULT_ADMIN_USER_ID = 1; // Use an ID that exists in your database

// Remove the duplicate CORS headers - they're handled by middleware

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';

    const blog = await prisma.blog.findFirst({
      where: {
        slug,
        locale,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        tags: true,
      },
    });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = await context.params;
    const data = await request.json();
    const locale = data.locale || 'en';

    const blog = await prisma.blog.findFirst({
      where: {
        slug,
        locale,
      },
    });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    const updatedBlog = await prisma.blog.update({
      where: {
        id: blog.id,
      },
      data: {
        title: data.title,
        titleHi: data.titleHi || null,
        content: data.content,
        contentHi: data.contentHi || null,
        status: data.status,
        metaDescription: data.metaDescription,
        metaDescriptionHi: data.metaDescriptionHi || null,
        ogTitle: data.ogTitle,
        ogTitleHi: data.ogTitleHi || null,
        ogDescription: data.ogDescription,
        ogDescriptionHi: data.ogDescriptionHi || null,
        authorName: data.authorName || 'Admin',
        authorNameHi: data.authorNameHi || null,
        authorId: DEFAULT_ADMIN_USER_ID, // Use fixed admin user ID
        categoryId: data.categoryId,
        tags: {
          set: [],
          connect: data.tags
        }
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    await prisma.blog.delete({
      where: { slug_locale: { slug, locale } },
    });

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}