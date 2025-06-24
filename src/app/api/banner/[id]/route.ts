import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BannerType, Banner } from '@/types/banner';
import { v2 as cloudinary } from 'cloudinary';
import { withCors, corsError } from '@/utils/cors';

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
      return corsError('Banner not found', 404);
    }

    return withCors(NextResponse.json(banner));
  } catch (error) {
    console.error('Error fetching banner:', error);
    return corsError('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Resolve the params promise

    // Parse JSON data
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.type) {
      return corsError('Title and type are required', 400);
    }

    // Get the current banner to check if type is being changed
    const currentBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!currentBanner) {
      return corsError('Banner not found', 404);
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
        return corsError(`A banner with type "${data.type}" already exists. Each banner type must be unique.`, 409);
      }
    }

    // Prepare the data to update
    const updateData: any = {
      title: data.title,
      titleHi: data.titleHi || null,
      type: data.type,
      description: data.description || null,
      descriptionHi: data.descriptionHi || null,
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

    // Return the updated banner with date fields converted to strings
    return withCors(NextResponse.json({
      ...updatedBanner,
      createdAt: updatedBanner.createdAt.toISOString(),
      updatedAt: updatedBanner.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error updating banner:', error);
    return corsError('Failed to update banner', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Resolve the params promise

    // Check if banner exists
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return corsError('Banner not found', 404);
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
    return withCors(NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
      id
    }));
  } catch (error) {
    console.error('Error deleting banner:', error);
    return corsError('Failed to delete banner', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (data.type && !VALID_BANNER_TYPES.includes(data.type)) {
      return corsError('Invalid banner type', 400);
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
    });

    const banner = {
      ...updatedBanner,
      createdAt: updatedBanner.createdAt.toISOString(),
      updatedAt: updatedBanner.updatedAt.toISOString(),
    };

    return withCors(NextResponse.json(banner));
  } catch (error) {
    console.error('Error updating banner:', error);
    return corsError('Failed to update banner', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
