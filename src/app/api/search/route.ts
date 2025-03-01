// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type SearchResult = {
  id: number;
  title: string;
  description: string;
  similarity_score: number;
};

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
    const [theNeedResults, eventsResults] = await Promise.all([
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
      // Add other tables here as needed
    ]);

    // Format results
    const results = [
      ...theNeedResults.map(item => ({
        record_id: item.id,
        match_text: item.mainText.substring(0, 100) + '...',
        source_table: 'the-need',
      })),
      // Add other results here
    ];

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
    status: 204,
    headers: corsHeaders
  });
}