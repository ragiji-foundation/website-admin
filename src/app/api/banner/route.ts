import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Banner, BannerType } from '@/types/banner';

const VALID_BANNER_TYPES: BannerType[] = [
  'blog', 'about', 'initiatives', 'successstories', 'home', 'media',
  'electronicmedia', 'gallery', 'newscoverage', 'ourstory', 'need',
  'centers', 'contactus', 'careers', 'awards'
];

export async function POST(
  request: NextRequest
): Promise<NextResponse<Banner | { error: string }>> {
  try {
    const formData = await request.formData();
    const file = formData.get('backgroundImage') as File | null;
    const type = formData.get('type') as BannerType;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;

    // Validate required fields
    if (!type || !title || !file) {
      return NextResponse.json(
        { error: 'Type, title and background image are required' },
        { status: 400 }
      );
    }

    // Validate banner type
    if (!VALID_BANNER_TYPES.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid banner type' },
        { status: 400 }
      );
    }

    // Upload image
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

    // Create banner
    const banner = await prisma.banner.create({
      data: {
        type,
        title,
        description,
        backgroundImage: url,
      },
    }) as Banner;

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
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
