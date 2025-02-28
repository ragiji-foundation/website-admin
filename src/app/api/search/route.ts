// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const results = await prisma.$queryRaw<
      { source_table: string; source_column: string; record_id: number; match_text: string; similarity_score: number }[]
    >`SELECT * FROM unified_search(${query}) ORDER BY similarity_score DESC;`;

    return NextResponse.json(results, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error executing search query:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

// The Access-Control-Allow-Origin header is set to *, allowing requests from any origin. For enhanced security, replace * with https://www.ragijifoundation.com to restrict access to your specific frontend domain.