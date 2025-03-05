import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BannerType, Banner } from '@/types/banner';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary (optional if you're using it here)
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true
  });
}

const VALID_BANNER_TYPES: BannerType[] = [
  'blog', 'about', 'initiatives', 'successstories', 'home', 'media',
  'electronicmedia', 'gallery', 'newscoverage', 'ourstory', 'need',
  'centers', 'contactus', 'careers', 'awards'
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Resolve the params promise
    const banner = await prisma.banner.findUnique({ where: { id } });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Banner | { error: string }>> {
  try {
    const { id } = await params; // Resolve the params promise

    // Parse JSON data
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    // Get the current banner to check if type is being changed
    const currentBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!currentBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    // If type is being changed, check if the new type is already in use
    if (data.type !== currentBanner.type) {
      const existingBanner = await prisma.banner.findFirst({
        where: {
          type: data.type,
          id: { not: id } // Exclude the current banner
        },
      });

      if (existingBanner) {
        return NextResponse.json(
          { error: `A banner with type "${data.type}" already exists. Each banner type must be unique.` },
          { status: 409 }
        );
      }
    }

    // Prepare the data to update
    const updateData: any = {
      title: data.title,
      type: data.type,
      description: data.description || null,
    };

    // Update the background image only if provided
    if (data.backgroundImage) {
      updateData.backgroundImage = data.backgroundImage;
    }

    // Update banner in database
    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...updatedBanner,
      createdAt: updatedBanner.createdAt.toISOString(),
      updatedAt: updatedBanner.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// Fix the return type to allow for { success: boolean }
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ message?: string; id?: string; success?: boolean; error?: string }>> {
  try {
    const { id } = await params; // Resolve the params promise

    // Check if banner exists
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // Delete the banner
    await prisma.banner.delete({ where: { id } });

    // Delete the image from Cloudinary if needed (optional)
    // if (banner.backgroundImage && banner.backgroundImage.includes('cloudinary')) {
    //   const publicId = banner.backgroundImage.split('/').pop()?.split('.')[0];
    //   if (publicId) {
    //     await cloudinary.uploader.destroy(`banners/${publicId}`);
    //   }
    // }

    // Return with both success and a message for better API consistency
    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Banner | { error: string }>> {
  try {
    const { id } = await params;
    const data = await request.json();

    if (data.type && !VALID_BANNER_TYPES.includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid banner type' },
        { status: 400 }
      );
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
    });

    const banner: Banner = {
      ...updatedBanner,
      createdAt: updatedBanner.createdAt.toISOString(),
      updatedAt: updatedBanner.updatedAt.toISOString(),
    };

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}
