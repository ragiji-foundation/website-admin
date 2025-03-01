import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
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
