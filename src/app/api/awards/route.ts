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
    const data = await request.json();
    const award = await prisma.award.create({ data });
    return NextResponse.json(award, { status: 201 });
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