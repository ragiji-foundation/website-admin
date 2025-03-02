import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors } from '@/utils/cors';

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const career = await prisma.career.findUnique({
      where: {
        slug: context.params.slug,
      }
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
    console.error('Error fetching career:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch career' },
        { status: 500 }
      )
    );
  }
}
