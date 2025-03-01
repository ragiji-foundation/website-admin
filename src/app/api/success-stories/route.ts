import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const stories = await prisma.successStory.findMany({
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' }
      ]
    });
    return NextResponse.json(stories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch success stories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const story = await prisma.successStory.create({ data });
    return NextResponse.json(story);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create success story' },
      { status: 500 }
    );
  }
}
