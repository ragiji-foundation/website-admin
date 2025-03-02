import { withCors, corsError } from '@/utils/cors';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const banner = await prisma.banner.create({ data });

    return withCors(NextResponse.json(banner, { status: 201 }));
  } catch (error) {
    console.error('Failed to create banner:', error);
    return corsError('Internal server error', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
