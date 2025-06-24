import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const centers = await prisma.center.findMany({
      orderBy: { name: 'asc' }
    });

    const transformedCenters = centers.map(center => ({
      id: center.id,
      name: center.name,
      nameHi: center.nameHi,
      location: center.location,
      locationHi: center.locationHi,
      description: center.description,
      descriptionHi: center.descriptionHi,
      imageUrl: center.imageUrl,
      contactInfo: center.contactInfo,
      createdAt: center.createdAt,
      updatedAt: center.updatedAt
    }));

    return withCors(NextResponse.json(transformedCenters));
  } catch (error) {
    console.error('Failed to fetch centers:', error);
    return corsError('Failed to fetch centers');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const createData = {
      name: body.name,
      nameHi: body.nameHi || '',
      location: body.location,
      locationHi: body.locationHi || '',
      description: body.description,
      descriptionHi: body.descriptionHi || '',
      imageUrl: body.imageUrl || '',
      contactInfo: body.contactInfo || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const center = await prisma.center.create({
      data: createData
    });
    return NextResponse.json(center, { status: 201 });
  } catch (error) {
    console.error('Failed to create center:', error);
    return NextResponse.json(
      { error: 'Failed to create center' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}