// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface SearchResult {
  record_id: string;
  match_text: string;
  source_table: string;
  title?: string;
  url?: string;
  type?: string;
}

// Add CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.ragijifoundation.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Search across multiple tables
    const [
      theNeedResults,
      ourStoryResults,
      successStoriesResults,
      blogsResults,
      initiativesResults
    ] = await Promise.all([
      // Search in TheNeed content
      prisma.theNeed.findMany({
        where: {
          OR: [
            { mainText: { contains: query, mode: 'insensitive' } },
            { statistics: { contains: query, mode: 'insensitive' } },
            { impact: { contains: query, mode: 'insensitive' } },
          ],
          isPublished: true,
        },
        select: {
          id: true,
          mainText: true,
        },
      }),

      // Search in OurStory content
      prisma.ourStory.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          content: true,
        },
      }),

      // Search in Success Stories
      prisma.successStory.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { personName: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          personName: true,
        },
      }),

      // Search in Blogs
      prisma.blog.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { metaDescription: { contains: query, mode: 'insensitive' } },
          ],
          status: 'PUBLISHED',
        },
        select: {
          id: true,
          title: true,
          slug: true,
          metaDescription: true,
        },
      }),

      // Search in Initiatives
      prisma.initiative.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
        },
      }),
    ]);

    // Format and combine results - removed type annotations to use inferred types
    const results: SearchResult[] = [
      ...theNeedResults.map(item => ({
        record_id: String(item.id),
        match_text: item.mainText.substring(0, 200) + '...',
        source_table: 'the-need',
        type: 'About',
        url: '/about/the-need'
      })),

      ...ourStoryResults.map(item => ({
        record_id: String(item.id),
        match_text: item.content.substring(0, 200) + '...',
        source_table: 'our-story',
        title: item.title,
        type: 'About',
        url: '/about/our-story'
      })),

      ...successStoriesResults.map(item => ({
        record_id: String(item.id),
        match_text: `${item.title} - ${item.personName}`,
        source_table: 'success-stories',
        title: item.title,
        type: 'Stories',
        url: `/success-stories/${item.id}`
      })),

      ...blogsResults.map(item => ({
        record_id: String(item.id),
        match_text: item.metaDescription || item.title,
        source_table: 'blogs',
        title: item.title,
        type: 'Blog',
        url: `/blog/${item.slug}`
      })),

      ...initiativesResults.map(item => ({
        record_id: String(item.id),
        match_text: item.description.substring(0, 200) + '...',
        source_table: 'initiatives',
        title: item.title,
        type: 'Initiatives',
        url: `/initiatives/${item.id}`
      })),
    ];

    // Sort results by relevance (you could implement custom sorting logic here)
    results.sort((a, b) => {
      // Prioritize exact matches in titles
      const aHasExactMatch = a.title?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bHasExactMatch = b.title?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      return bHasExactMatch - aHasExactMatch;
    });

    return NextResponse.json(results, {
      headers: {
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEBSITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}