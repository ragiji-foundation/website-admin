import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const awards = await prisma.award.findMany({
      orderBy: { year: 'desc' }
    });

    return withCors(NextResponse.json(awards));
  } catch (error) {
    console.error('Failed to fetch awards:', error);
    return corsError('Failed to fetch awards');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const createData = {
      title: body.title,
      titleHi: body.titleHi || '',
      year: body.year,
      description: body.description,
      descriptionHi: body.descriptionHi || '',
      imageUrl: body.imageUrl,
      organization: body.organization,
      organizationHi: body.organizationHi || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const award = await prisma.award.create({ data: createData });
    const transformedAward = {
      id: award.id,
      title: award.title,
      titleHi: award.titleHi,
      year: award.year,
      description: award.description,
      descriptionHi: award.descriptionHi,
      imageUrl: award.imageUrl,
      organization: award.organization,
      organizationHi: award.organizationHi,
      createdAt: award.createdAt,
      updatedAt: award.updatedAt
    };
    return NextResponse.json(transformedAward, { status: 201 });
  } catch (error) {
    console.error('Failed to create award:', error);
    return NextResponse.json(
      { error: 'Failed to create award' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}