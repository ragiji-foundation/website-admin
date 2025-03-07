import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors } from '@/utils/cors';

export async function GET(request: NextRequest) {
  try {
    const banners = await prisma.banner.findMany();

    // Return a simplified response that's easy to debug
    const simplifiedBanners = banners.map(banner => ({
      id: banner.id,
      type: banner.type,
      title: banner.title
    }));

    return withCors(NextResponse.json({
      count: banners.length,
      types: banners.map(b => b.type),
      banners: simplifiedBanners
    }), request);
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch banners for debugging' },
        { status: 500 }
      ),
      request
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return withCors(new NextResponse(null, { status: 200 }), request);
}
