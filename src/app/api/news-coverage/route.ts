import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const news = await prisma.newsArticle.findMany({
      orderBy: { date: 'desc' },
      select: {
        id: true,
        title: true,
        titleHi: true,
        source: true,
        date: true,
        imageUrl: true,
        link: true,
        description: true,
        descriptionHi: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const news = await prisma.newsArticle.create({
      data: {
        title: data.title,
        titleHi: data.titleHi || '',
        source: data.source,
        date: new Date(data.date),
        imageUrl: data.imageUrl,
        link: data.link,
        description: data.description,
        descriptionHi: data.descriptionHi || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
}