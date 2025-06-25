import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = context.params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const career = await prisma.career.findUnique({
      where: {
        slug: slug,
      }
    });

    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    // Return localized content based on locale
    const localizedCareer = {
      ...career,
      title: locale === 'hi' && career.titleHi ? career.titleHi : career.title,
      location: locale === 'hi' && career.locationHi ? career.locationHi : career.location,
      type: locale === 'hi' && career.typeHi ? career.typeHi : career.type,
      description: locale === 'hi' && career.descriptionHi ? career.descriptionHi : career.description,
      requirements: locale === 'hi' && career.requirementsHi ? career.requirementsHi : career.requirements,
    };

    return NextResponse.json(localizedCareer);
  } catch (error) {
    console.error('Error fetching career:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = context.params;
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.requirements) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const career = await prisma.career.update({
      where: {
        slug: slug,
      },
      data: {
        title: data.title,
        titleHi: data.titleHi || '',
        location: data.location,
        locationHi: data.locationHi || '',
        type: data.type,
        typeHi: data.typeHi || '',
        description: data.description,
        descriptionHi: data.descriptionHi || '',
        requirements: data.requirements,
        requirementsHi: data.requirementsHi || '',
        isActive: data.isActive ?? true,
        updatedAt: new Date()
      },
    });

    return NextResponse.json(career);
  } catch (error) {
    console.error('Error updating career:', error);
    return NextResponse.json(
      { error: 'Failed to update career' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const { slug } = context.params;
    await prisma.career.delete({
      where: {
        slug: slug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting career:', error);
    return NextResponse.json(
      { error: 'Failed to delete career' },
      { status: 500 }
    );
  }
}
