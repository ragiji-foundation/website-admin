import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const articles = await prisma.newsArticle.findMany({
      orderBy: { date: 'desc' }
    });

    const localizedArticles = articles.map(article => ({
      ...article,
      title: locale === 'hi' && article.titleHi ? article.titleHi : article.title,
      description: locale === 'hi' && article.descriptionHi ? article.descriptionHi : article.description,
    }));

    return withCors(NextResponse.json(localizedArticles));
  } catch (error) {
    console.error('Failed to fetch news articles:', error);
    return corsError('Failed to fetch news articles');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const article = await prisma.newsArticle.create({
      data: {
        title: body.title,
        titleHi: body.titleHi || '',
        source: body.source,
        date: new Date(body.date || Date.now()),
        imageUrl: body.imageUrl || '',
        link: body.link || '',
        description: body.description || '',
        descriptionHi: body.descriptionHi || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return withCors(NextResponse.json(article, { status: 201 }));
  } catch (error) {
    console.error('Failed to create news article:', error);
    return corsError('Failed to create news article');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
