import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const images = await prisma.gallery.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const image = await prisma.gallery.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
} 