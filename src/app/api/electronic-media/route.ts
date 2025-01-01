import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function GET() {
  try {
    const media = await prisma.electronicMedia.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching electronic media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch electronic media' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const media = await prisma.electronicMedia.create({
      data
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error('Error creating electronic media:', error);
    return NextResponse.json(
      { error: 'Failed to create electronic media' },
      { status: 500 }
    );
  }
} 