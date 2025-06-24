import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import type { Stat, StatCreateInput } from '@/types/stats';

export async function GET(
  request: NextRequest
): Promise<NextResponse<Stat[] | { error: string }>> {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        value: true,
        label: true,
        labelHi: true,
        icon: true,
        order: true,
        createdAt: true,
        updatedAt: true
      }
    });
    const transformedStats = stats.map(stat => ({
      ...stat,
      labelHi: stat.labelHi ?? undefined,
      icon: stat.icon ?? undefined
    }));
    return withCors(NextResponse.json(transformedStats));
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
        label: data.label,
        labelHi: data.labelHi || '',
        value: data.value,
        icon: data.icon,
        order: nextOrder,
        createdAt: new Date(),
        updatedAt: new Date()
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
