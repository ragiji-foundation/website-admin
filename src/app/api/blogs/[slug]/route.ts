import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const slug = context.params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.findFirst({
      where: { slug, locale },
      include: {
        author: { select: { name: true, image: true } },
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
  } catch (err) {
    console.error('Error fetching blog:', err);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
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
    const slug = context.params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { locale, title, content, status, metaDescription, ogTitle, ogDescription, categoryId, tagIds } = body;

    if (!locale) {
      return NextResponse.json(
        { error: 'Locale is required' },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.update({
      where: {
        slug_locale: { slug, locale },
      },
      data: {
        title,
        content,
        status,
        metaDescription,
        ogTitle,
        ogDescription,
        categoryId,
        tags: { set: tagIds?.map((id: number) => ({ id })) || [] },
      },
      include: {
        author: { select: { name: true, image: true } },
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(blog);
  } catch (err) {
    console.error('Error updating blog:', err);
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
    const slug = context.params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    await prisma.blog.delete({
      where: { slug_locale: { slug, locale } },
    });

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}