import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors } from '@/utils/cors';

// Helper to delete old media
async function deleteMedia(url: string) {
  if (!url) return;
  try {
    await fetch(process.env.MEDIA_DELETE_API || '/api/media-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    console.error('Failed to delete media:', err);
  }
}

export async function GET() {
  try {
    const theNeed = await prisma.theNeed.findFirst({
      select: {
        id: true,
        mainText: true,
        mainTextHi: true,
        statistics: true,
        statisticsHi: true,
        impact: true,
        impactHi: true,
        imageUrl: true,
        statsImageUrl: true,
        isPublished: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return withCors(NextResponse.json(theNeed));
  } catch (error) {
    console.error('Error fetching The Need data:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch The Need data' },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Enforce single entry
    const existing = await prisma.theNeed.findFirst();
    if (existing) {
      return withCors(
        NextResponse.json(
          { error: 'The Need content already exists.' },
          { status: 409 }
        )
      );
    }

    const body = await request.json();
    const theNeed = await prisma.theNeed.create({
      data: {
        mainText: body.mainText,
        mainTextHi: body.mainTextHi || '',
        statistics: body.statistics,
        statisticsHi: body.statisticsHi || '',
        impact: body.impact,
        impactHi: body.impactHi || '',
        imageUrl: body.imageUrl,
        statsImageUrl: body.statsImageUrl,
        isPublished: body.isPublished,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return withCors(NextResponse.json(theNeed, { status: 201 }));
  } catch (error) {
    console.error('Error creating The Need data:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to create The Need data' },
        { status: 500 }
      )
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = await prisma.theNeed.findUnique({ where: { id: body.id } });

    // Delete old images if new ones are provided
    if (existing) {
      if (body.imageUrl && body.imageUrl !== existing.imageUrl) {
        await deleteMedia(existing.imageUrl);
      }
      if (body.statsImageUrl && body.statsImageUrl !== existing.statsImageUrl) {
        await deleteMedia(existing.statsImageUrl);
      }
    }

    const theNeed = await prisma.theNeed.update({
      where: { id: body.id },
      data: {
        mainText: body.mainText,
        mainTextHi: body.mainTextHi || '',
        statistics: body.statistics,
        statisticsHi: body.statisticsHi || '',
        impact: body.impact,
        impactHi: body.impactHi || '',
        imageUrl: body.imageUrl,
        statsImageUrl: body.statsImageUrl,
        isPublished: body.isPublished,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });
    return withCors(NextResponse.json(theNeed));
  } catch (error) {
    console.error('Error updating The Need data:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to update The Need data' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

