import { NextRequest, NextResponse } from 'next/server';
import prisma  from '@/lib/prisma';

export async function GET() {
  try {
    const centers = await prisma.center.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(centers);
  } catch (error) {
    console.error('Error fetching centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch centers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const center = await prisma.center.create({
      data
    });
    return NextResponse.json(center);
  } catch (error) {
    console.error('Error creating center:', error);
    return NextResponse.json(
      { error: 'Failed to create center' },
      { status: 500 }
    );
  }
} 