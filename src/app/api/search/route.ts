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
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const results = await prisma.$queryRaw<SearchResult[]>`
      SELECT * FROM unified_search(${query}::text)
      WHERE similarity_score > 0.1
      ORDER BY similarity_score DESC
      LIMIT 10
    `;

    return NextResponse.json(results, { headers: corsHeaders });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}