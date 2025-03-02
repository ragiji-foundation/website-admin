import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const centers = await prisma.center.findMany({
      orderBy: { name: 'asc' }
    });

    return withCors(NextResponse.json(centers));
  } catch (error) {
    console.error('Failed to fetch centers:', error);
    return corsError('Failed to fetch centers');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const center = await prisma.center.create({
      data
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