import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { order: 'asc' }
    });
    return withCors(NextResponse.json(stats));
  } catch (error) {
    return corsError('Failed to fetch stats');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const stat = await prisma.stat.create({ data });
    return NextResponse.json(stat);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create stat' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
