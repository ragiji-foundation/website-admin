import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Banner, BannerType } from '@/types/banner';

const VALID_BANNER_TYPES: BannerType[] = [
  'blog', 'about', 'initiatives', 'successstories', 'home', 'media',
  'electronicmedia', 'gallery', 'newscoverage', 'ourstory', 'need',
  'centers', 'contactus', 'careers', 'awards'
];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Banner | { error: string }>> {
  try {
    const { id } = await params; // Resolve the params promise
    const formData = await request.formData();
    const file = formData.get('backgroundImage') as File | null;
    const type = formData.get('type') as BannerType;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    if (!VALID_BANNER_TYPES.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid banner type' },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;
    if (file) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'banners');

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await uploadResponse.json();
      imageUrl = url;
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        type,
        title,
        description,
        ...(imageUrl && { backgroundImage: imageUrl }),
      },
    }) as Banner; // Cast to Banner type

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ message: string; id: string } | { error: string }>> {
  try {
    const { id } = await params; // Resolve the params promise
    const banner = await prisma.banner.delete({
      where: { id },
    }) as Banner;

    return NextResponse.json({
      message: 'Banner deleted successfully',
      id: banner.id
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

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
    }) as Banner; // Cast to Banner type

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}
