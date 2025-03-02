import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const stories = await prisma.successStory.findMany({
      where: { featured: true },
      orderBy: { order: 'asc' }
    });
    return withCors(NextResponse.json(stories));
  } catch (error) {
    return corsError('Failed to fetch success stories');
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

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
