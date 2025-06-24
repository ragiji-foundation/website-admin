import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import type { Initiative } from '@prisma/client';

export async function GET() {
  try {
    const initiatives = await prisma.initiative.findMany({
      orderBy: { order: 'asc' }
    });

    const transformedInitiatives = initiatives.map((initiative: Initiative) => ({
      id: initiative.id,
      title: initiative.title,
      titleHi: initiative.titleHi,
      description: initiative.description,
      descriptionHi: initiative.descriptionHi,
      imageUrl: initiative.imageUrl,
      order: initiative.order,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt
    }));

    return withCors(NextResponse.json(transformedInitiatives));
  } catch (error) {
    console.error('Failed to fetch initiatives:', error);
    return corsError('Failed to fetch initiatives');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const createData = {
      title: body.title,
      titleHi: body.titleHi || '',
      description: body.description,
      descriptionHi: body.descriptionHi || '',
      imageUrl: body.imageUrl || '',
      order: body.order || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const initiative = await prisma.initiative.create({ data: createData });

    const transformedInitiative = {
      id: initiative.id,
      title: initiative.title,
      titleHi: initiative.titleHi,
      description: initiative.description,
      descriptionHi: initiative.descriptionHi,
      imageUrl: initiative.imageUrl,
      order: initiative.order,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt
    };

    return NextResponse.json(transformedInitiative, { status: 201 });
  } catch (error) {
    console.error('Failed to create initiative:', error);
    return NextResponse.json(
      { error: 'Failed to create initiative' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}