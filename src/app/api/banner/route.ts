import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BannerType } from '@/types/banner';
import { withCors, corsError } from '@/utils/cors';

// Update this list to ensure we have the correct types
const VALID_BANNER_TYPES: BannerType[] = [
  'blog', 'about', 'initiatives', 'successstories', 'home', 'media',
  'electronicmedia', 'gallery', 'newscoverage', 'ourstory', 'need',
  'centers', 'contactus', 'careers', 'awards'
];

// GET all banners
export async function GET(request: NextRequest) {
  // Add CORS headers for all origins during development
  const origin = request.headers.get('origin') || '*';

  try {
    const banners = await prisma.banner.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return withCors(NextResponse.json(banners));
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return corsError('Internal server error', 500);
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.type || !data.backgroundImage) {
      return corsError('Title, type, and backgroundImage are required fields', 400);
    }

    // Validate banner type
    if (!VALID_BANNER_TYPES.includes(data.type)) {
      return corsError('Invalid banner type', 400);
    }

    // Check if a banner with this type already exists - ENABLED to ensure uniqueness
    const existingBanner = await prisma.banner.findFirst({
      where: { type: data.type },
    });

    if (existingBanner) {
      return corsError(`A banner with type "${data.type}" already exists. Please update the existing banner instead of creating a new one.`, 409);
    }

    // Create the banner
    const banner = await prisma.banner.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description || null,
        backgroundImage: data.backgroundImage,
      },
    });

    return withCors(NextResponse.json(banner, { status: 201 }));
  } catch (error) {
    console.error('Error creating banner:', error);
    return corsError('Failed to create banner', 500);
  }
}

// PATCH - Update multiple banners (batch update)
export async function PATCH(request: NextRequest) {
  try {
    const { banners } = await request.json();

    if (!Array.isArray(banners) || banners.length === 0) {
      return corsError('No banners provided for update', 400);
    }

    // Process each banner update
    const updatePromises = banners.map(async (bannerData) => {
      if (!bannerData.id) {
        return { error: 'Banner ID is required', banner: bannerData };
      }

      try {
        return await prisma.banner.update({
          where: { id: bannerData.id },
          data: {
            title: bannerData.title,
            description: bannerData.description,
            backgroundImage: bannerData.backgroundImage,
            type: bannerData.type,
          },
        });
      } catch (error) {
        return { error: `Failed to update banner ID: ${bannerData.id}`, banner: bannerData };
      }
    });

    const results = await Promise.all(updatePromises);
    return withCors(NextResponse.json({ results }));
  } catch (error) {
    console.error('Error in batch update:', error);
    return corsError('Failed to process batch update', 500);
  }
}

// PUT - Not typically used for collections
export async function PUT() {
  return corsError('Method not allowed', 405);
}

// DELETE - Delete multiple banners
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ids = url.searchParams.get('ids')?.split(',');

    if (!ids || ids.length === 0) {
      return corsError('No banner IDs provided for deletion', 400);
    }

    // Delete the banners
    const result = await prisma.banner.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return withCors(NextResponse.json({
      message: `Deleted ${result.count} banners`,
      count: result.count,
    }));
  } catch (error) {
    console.error('Error deleting banners:', error);
    return corsError('Failed to delete banners', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
