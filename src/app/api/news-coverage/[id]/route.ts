import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  apiSuccess, 
  handleOptionsWithParams, 
  withApiHandler,
  validateRequired,
  CrudResponses,
  handleDatabaseError,
  logApiCall
} from '@/utils/centralized';

export const GET = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Fetching news article ${id}`);
  
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const article = await prisma.newsArticle.findUnique({
      where: { id: parseInt(id) }
    });

    if (!article) {
      return CrudResponses.notFound();
    }

    const localizedArticle = {
      ...article,
      title: locale === 'hi' && article.titleHi ? article.titleHi : article.title,
      description: locale === 'hi' && article.descriptionHi ? article.descriptionHi : article.description,
    };

    return apiSuccess(localizedArticle, 'News article fetched successfully');
  } catch (error) {
    return handleDatabaseError(error, 'fetch news article');
  }
});

export const PUT = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Updating news article ${id}`);
  
  try {
    const body = await request.json();
    
    // Validate required fields for update
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
      updatedAt: new Date()
    };

    const updatedArticle = await prisma.newsArticle.update({
      where: { id: parseInt(id) },
      data: validFields
    });

    return apiSuccess(updatedArticle, 'News article updated successfully');
  } catch (error) {
    return handleDatabaseError(error, 'update news article');
  }
});

export const DELETE = withApiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  logApiCall(request, `Deleting news article ${id}`);
  
  try {
    await prisma.newsArticle.delete({
      where: { id: parseInt(id) }
    });

    return CrudResponses.deleted();
  } catch (error) {
    return handleDatabaseError(error, 'delete news article');
  }
});

export const OPTIONS = handleOptionsWithParams;
