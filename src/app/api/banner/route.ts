import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BannerType } from '@/types/banner';

// Define valid banner types for validation
const VALID_BANNER_TYPES: BannerType[] = [
  'blog', 'about', 'initiatives', 'successstories', 'home', 'media',
  'electronicmedia', 'gallery', 'newscoverage', 'ourstory', 'need',
  'centers', 'contactus', 'careers', 'awards'
];

// GET all banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.type || !data.backgroundImage) {
      return NextResponse.json(
        { error: 'Title, type, and backgroundImage are required fields' },
        { status: 400 }
      );
    }

    // Validate banner type
    if (!VALID_BANNER_TYPES.includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid banner type' },
        { status: 400 }
      );
    }

    // Check if a banner with this type already exists - ENABLED to ensure uniqueness
    const existingBanner = await prisma.banner.findFirst({
      where: { type: data.type },
    });

    if (existingBanner) {
      return NextResponse.json(
        { error: `A banner with type "${data.type}" already exists. Please update the existing banner instead of creating a new one.` },
        { status: 409 }
      );
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

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// PATCH - Update multiple banners (batch update)
export async function PATCH(request: NextRequest) {
  try {
    const { banners } = await request.json();

    if (!Array.isArray(banners) || banners.length === 0) {
      return NextResponse.json(
        { error: 'No banners provided for update' },
        { status: 400 }
      );
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
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in batch update:', error);
    return NextResponse.json(
      { error: 'Failed to process batch update' },
      { status: 500 }
    );
  }
}

// PUT - Not typically used for collections
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

// DELETE - Delete multiple banners
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ids = url.searchParams.get('ids')?.split(',');

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: 'No banner IDs provided for deletion' },
        { status: 400 }
      );
    }

    // Delete the banners
    const result = await prisma.banner.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} banners`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error deleting banners:', error);
    return NextResponse.json(
      { error: 'Failed to delete banners' },
      { status: 500 }
    );
  }
}
