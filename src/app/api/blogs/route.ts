import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';
import { withCors, corsError } from '@/utils/cors';

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

// Remove the duplicate CORS headers - they're handled by middleware

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const locale = searchParams.get('locale') || 'en';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleHi: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // Get total count
    const total = await prisma.blog.count({ where });

    // Get blogs
    const blogs = await prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        titleHi: true,
        slug: true,
        content: true,
        contentHi: true,
        locale: true,
        status: true,
        authorName: true,
        authorNameHi: true,
        metaDescription: true,
        metaDescriptionHi: true,
        ogTitle: true,
        ogTitleHi: true,
        ogDescription: true,
        ogDescriptionHi: true,
        featuredImage: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true
          }
        }
      }
    });

    // Transform data based on locale
    const transformedBlogs = blogs.map(blog => {
      const isHindi = locale === 'hi';
      return {
        ...blog,
        title: isHindi && blog.titleHi ? blog.titleHi : blog.title,
        content: isHindi && blog.contentHi ? blog.contentHi : blog.content,
        authorName: isHindi && blog.authorNameHi ? blog.authorNameHi : (blog.authorName || blog.author?.name || 'Unknown'),
        metaDescription: isHindi && blog.metaDescriptionHi ? blog.metaDescriptionHi : blog.metaDescription,
        ogTitle: isHindi && blog.ogTitleHi ? blog.ogTitleHi : blog.ogTitle,
        ogDescription: isHindi && blog.ogDescriptionHi ? blog.ogDescriptionHi : blog.ogDescription,
        // Keep original fields for reference
        titleHi: blog.titleHi ?? undefined,
        contentHi: blog.contentHi ?? undefined,
        excerpt: (isHindi && blog.contentHi ? blog.contentHi : blog.content) ? 
          (isHindi && blog.contentHi ? blog.contentHi : blog.content).replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        status: blog.status || 'draft',
        featuredImage: undefined, // TODO: Enable after migration: blog.featuredImage || undefined,
        tags: []
      };
    });

    const pages = Math.ceil(total / limit);

    return withCors(NextResponse.json({
      blogs: transformedBlogs,
      pagination: {
        total,
        pages,
        page,
        limit
      }
    }));
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return corsError('Failed to fetch blogs', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Enhanced validation for bilingual content
    const validateLocaleContent = (locale: string) => {
      if (locale === 'en') {
        if (!data.title || !data.content) {
          throw new Error('English title and content are required');
        }
      } else if (locale === 'hi') {
        if (!data.titleHi || !data.contentHi) {
          throw new Error('Hindi title and content are required');
        }
      }
    };

    // Validate based on locale
    validateLocaleContent(data.locale);
    
    // Generate slug from appropriate title
    const baseSlug = slugify(
      data.locale === 'hi' ? data.titleHi : data.title,
      { lower: true, strict: true }
    );

    // Check for unique slug + locale combination
    const existingBlog = await prisma.blog.findFirst({
      where: {
        OR: [
          { slug: baseSlug, locale: 'en' },
          { slug: baseSlug, locale: 'hi' }
        ]
      }
    });

    // Generate unique slug if needed
    let slug = baseSlug;
    if (existingBlog) {
      const count = await prisma.blog.count({
        where: {
          slug: {
            startsWith: baseSlug,
          }
        },
      });
      slug = `${baseSlug}-${count + 1}`;
    }

    // Create the blog posts with a transaction
    const blog = await prisma.$transaction(async (tx) => {
      // Helper function to create a blog in specific locale
      const createBlogInLocale = async (locale: 'en' | 'hi') => {
        const isHindi = locale === 'hi';
        return tx.blog.create({
          data: {
            title: isHindi ? data.titleHi : data.title,
            content: isHindi ? data.contentHi : data.content,
            slug: slug, // Use same slug for both versions
            locale: locale,
            status: data.status || 'draft',
            authorName: isHindi ? (data.authorNameHi || data.authorName) : data.authorName,
            metaDescription: isHindi ? (data.metaDescriptionHi || data.metaDescription) : data.metaDescription,
            ogTitle: isHindi ? (data.ogTitleHi || data.ogTitle) : data.ogTitle,
            ogDescription: isHindi ? (data.ogDescriptionHi || data.ogDescription) : data.ogDescription,
            authorId: DEFAULT_ADMIN_USER_ID,
            categoryId: data.categoryId ? parseInt(data.categoryId.toString()) : null,
            tags: {
              connect: data.tags?.map((tag: { id: number }) => ({
                id: parseInt(tag.id.toString())
              })) || []
            }
          },
          include: {
            category: true,
            tags: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          },
        });
      };

      // Create the requested locale version
      const primaryBlog = await createBlogInLocale(data.locale as 'en' | 'hi');

      // If other locale content is provided, create that version too
      if (data.locale === 'en' && data.titleHi && data.contentHi) {
        await createBlogInLocale('hi');
      } else if (data.locale === 'hi' && data.title && data.content) {
        await createBlogInLocale('en');
      }

      return primaryBlog;
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

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}