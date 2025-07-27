import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  apiSuccess, 
  handleOptions, 
  withApiHandler,
  validateRequired,
  CrudResponses,
  handleDatabaseError,
  logApiCall
} from '@/utils/centralized';

export const GET = withApiHandler(async (request: NextRequest) => {
  logApiCall(request, 'Fetching news articles');
  
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

    return apiSuccess(localizedArticles, 'News articles fetched successfully');
  } catch (error) {
    return handleDatabaseError(error, 'fetch news articles');
  }
});

export const POST = withApiHandler(async (request: NextRequest) => {
  logApiCall(request, 'Creating news article');
  
  try {
    const body = await request.json();
    
    // Centralized validation
    validateRequired(body, ['title', 'source', 'date']);
    
    const validFields = {
      title: body.title,
      titleHi: body.titleHi || '',
      source: body.source,
      date: new Date(body.date),
      imageUrl: body.imageUrl || '',
      link: body.link || '',
      description: body.description || '',
      descriptionHi: body.descriptionHi || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const article = await prisma.newsArticle.create({
      data: validFields
    });

    return CrudResponses.created(article);
  } catch (error) {
    return handleDatabaseError(error, 'create news article');
  }
});

export const OPTIONS = handleOptions;
