import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const initiatives = await prisma.initiative.findMany({
      orderBy: { order: 'asc' }
    });

    return withCors(NextResponse.json(initiatives));
  } catch (error) {
    console.error('Failed to fetch initiatives:', error);
    return corsError('Failed to fetch initiatives');
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const initiative = await prisma.initiative.create({ data });
    return NextResponse.json(initiative, { status: 201 });
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