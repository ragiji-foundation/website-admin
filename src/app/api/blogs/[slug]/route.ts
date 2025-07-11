import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    // Use the correct compound unique key from schema: @@unique([slug, locale])
    const blog = await prisma.blog.findUnique({
      where: { 
        slug_locale: {
          slug,
          locale
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!blog) {
      return corsError('Blog not found', 404);
    }

    return withCors(NextResponse.json(blog));
  } catch (error) {
    console.error('Error fetching blog:', error);
    return corsError('Failed to fetch blog', 500);
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const { slug } = params;
    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const existingBlog = await prisma.blog.findUnique({
      where: { 
        slug_locale: {
          slug,
          locale
        }
      }
    });

    if (!existingBlog) {
      return corsError('Blog not found', 404);
    }

    const updatedBlog = await prisma.blog.update({
      where: { 
        slug_locale: {
          slug,
          locale
        }
      },
      data: {
        title: data.title || existingBlog.title,
        titleHi: data.titleHi !== undefined ? data.titleHi : existingBlog.titleHi,
        content: data.content || existingBlog.content,
        contentHi: data.contentHi !== undefined ? data.contentHi : existingBlog.contentHi,
        status: data.status || existingBlog.status,
        authorName: data.authorName || existingBlog.authorName,
        authorNameHi: data.authorNameHi !== undefined ? data.authorNameHi : existingBlog.authorNameHi,
        metaDescription: data.metaDescription !== undefined ? data.metaDescription : existingBlog.metaDescription,
        metaDescriptionHi: data.metaDescriptionHi !== undefined ? data.metaDescriptionHi : existingBlog.metaDescriptionHi,
        ogTitle: data.ogTitle !== undefined ? data.ogTitle : existingBlog.ogTitle,
        ogTitleHi: data.ogTitleHi !== undefined ? data.ogTitleHi : existingBlog.ogTitleHi,
        ogDescription: data.ogDescription !== undefined ? data.ogDescription : existingBlog.ogDescription,
        ogDescriptionHi: data.ogDescriptionHi !== undefined ? data.ogDescriptionHi : existingBlog.ogDescriptionHi,
        categoryId: data.categoryId !== undefined ? data.categoryId : existingBlog.categoryId,
        authorId: data.authorId !== undefined ? data.authorId : existingBlog.authorId,
        updatedAt: new Date()
      },
      include: {
        author: true,
        category: true,
        tags: true
      }
    });

    // Handle tags update if provided
    if (data.tags) {
      await prisma.blog.update({
        where: { 
          slug_locale: {
            slug,
            locale
          }
        },
        data: {
          tags: {
            set: [], // Clear existing tags
            connect: data.tags.map((tag: any) => ({ id: tag.id }))
          }
        }
      });
    }

    return withCors(NextResponse.json(updatedBlog));
  } catch (error) {
    console.error('Error updating blog:', error);
    return corsError('Failed to update blog', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const existingBlog = await prisma.blog.findUnique({
      where: { 
        slug_locale: {
          slug,
          locale
        }
      }
    });

    if (!existingBlog) {
      return corsError('Blog not found', 404);
    }

    await prisma.blog.delete({
      where: { 
        slug_locale: {
          slug,
          locale
        }
      }
    });

    return withCors(NextResponse.json({ message: 'Blog deleted successfully' }));
  } catch (error) {
    console.error('Error deleting blog:', error);
    return corsError('Failed to delete blog', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}