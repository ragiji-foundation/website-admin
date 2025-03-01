import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Feature, FeatureSection, FeatureWithSection } from '@/types/feature';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(
  request: NextRequest,
  context: any
): Promise<NextResponse<FeatureWithSection[] | { error: string }>> {
  try {
    const { identifier } = context.params;

    // First get the section
    const section = await prisma.featureSection.findUnique({
      where: { identifier }
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    // Then get all features for this section
    const features = await prisma.feature.findMany({
      where: { section: identifier },
      orderBy: { order: 'asc' }
    });

    // Combine the data
    const featuresWithSection = features.map(feature => ({
      ...feature,
      sectionDetails: section
    }));

    return NextResponse.json(featuresWithSection);
  } catch (error) {
    console.error('Features fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(
  request: NextRequest,
  context: any
): Promise<NextResponse<Feature | { error: string }>> {
  try {
    const { identifier } = context.params;
    const body = await request.json();
    const feature = await prisma.feature.update({
      where: { id: body.id, section: identifier },
      data: body
    });
    return NextResponse.json(feature);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update feature' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(
  request: NextRequest,
  context: any
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const { identifier } = context.params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    await prisma.feature.delete({
      where: {
        id,
        section: identifier
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete feature' },
      { status: 500 }
    );
  }
}
