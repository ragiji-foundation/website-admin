import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (request.method === 'OPTIONS') {
    return corsError('CORS error', 400);
  }

  try {
    const career = await prisma.career.findUnique({
      where: { slug: params.slug }
    });

    if (!career) {
      return withCors(
        NextResponse.json(
          { error: 'Career not found' },
          { status: 404 }
        )
      );
    }

    return withCors(NextResponse.json(career));
  } catch (error) {
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch career' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
