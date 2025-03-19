import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   context: any
) {
  try {
    const id = parseInt(context.params.id);
    const { direction } = await request.json();
    const url = new URL(request.url);

    const currentNews = await prisma.newsArticle.findUnique({
      where: { id }
    });

    if (!currentNews) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }

    const adjacentNews = await prisma.newsArticle.findFirst({
      where: {
        date: direction === 'up'
          ? { gt: currentNews.date }
          : { lt: currentNews.date }
      },
      orderBy: {
        date: direction === 'up' ? 'asc' : 'desc'
      }
    });

    if (!adjacentNews) {
      return NextResponse.json({ error: 'Cannot move further' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.newsArticle.update({
        where: { id: currentNews.id },
        data: { date: adjacentNews.date }
      }),
      prisma.newsArticle.update({
        where: { id: adjacentNews.id },
        data: { date: currentNews.date }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering news:', error);
    return NextResponse.json(
      { error: 'Failed to reorder news' },
      { status: 500 }
    );
  }
} 