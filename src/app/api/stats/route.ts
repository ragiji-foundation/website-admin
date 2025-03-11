import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import type { Stat, StatCreateInput } from '@/types/stats';

export async function GET(
  request: NextRequest
): Promise<NextResponse<Stat[] | { error: string }>> {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { order: 'asc' }
    });
    return withCors(NextResponse.json(stats));
  } catch (error) {
    return corsError('Failed to fetch stats');
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<Stat | { error: string }>> {
  try {
    const data = await request.json();

    // Get max order value
    const maxOrder = await prisma.stat.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const nextOrder = (maxOrder?.order ?? -1) + 1;

    const stat = await prisma.stat.create({
      data: {
        ...data,
        order: nextOrder
      }
    });

    return withCors(NextResponse.json(stat as Stat, { status: 201 }));
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
