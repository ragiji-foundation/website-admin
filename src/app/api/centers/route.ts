import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const centers = await prisma.center.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const localizedCenters = centers.map(center => ({
      ...center,
      name: locale === 'hi' && center.nameHi ? center.nameHi : center.name,
      location: locale === 'hi' && center.locationHi ? center.locationHi : center.location,
      description: locale === 'hi' && center.descriptionHi ? center.descriptionHi : center.description,
    }));

    return withCors(NextResponse.json(localizedCenters));
  } catch (error) {
    console.error('Failed to fetch centers:', error);
    return corsError('Failed to fetch centers');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const center = await prisma.center.create({
      data: {
        name: data.name,
        nameHi: data.nameHi || '',
        location: data.location,
        locationHi: data.locationHi || '',
        description: data.description,
        descriptionHi: data.descriptionHi || '',
        imageUrl: data.imageUrl || '',
        contactInfo: data.contactInfo || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return withCors(NextResponse.json(center, { status: 201 }));
  } catch (error) {
    console.error('Failed to create center:', error);
    return corsError('Failed to create center');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}