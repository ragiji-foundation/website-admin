import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';
import { generateSlug } from '@/utils/slug';

function serializeRichText(content: any): string {
  if (typeof content === 'string') return content;
  if (!content) return '';

  try {
    // If it's a Lexical editor state object
    if (content.json) {
      return JSON.stringify(content.json);
    }
    // If it's already a JSON object
    return JSON.stringify(content);
  } catch (error) {
    console.error('Error serializing rich text:', error);
    return '';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const isHindi = locale === 'hi';
    
    // Get all careers
    const careers = await prisma.career.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to include localized content
    const localizedCareers = careers.map(career => ({
      ...career,
      title: isHindi && career.titleHi ? career.titleHi : career.title,
      description: isHindi && career.descriptionHi ? career.descriptionHi : career.description,
      requirements: isHindi && career.requirementsHi ? career.requirementsHi : career.requirements,
    }));

    return withCors(NextResponse.json(localizedCareers));
  } catch (error) {
    console.error('Error fetching careers:', error);
    return corsError('Failed to fetch careers', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const slug = generateSlug(data.title);

    const createData = {
      title: data.title,
      titleHi: data.titleHi || '',
      slug,
      location: data.location,
      locationHi: data.locationHi || '',
      type: data.type,
      typeHi: data.typeHi || '',
      description: serializeRichText(data.description),
      descriptionHi: serializeRichText(data.descriptionHi),
      requirements: serializeRichText(data.requirements),
      requirementsHi: serializeRichText(data.requirementsHi),
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const career = await prisma.career.create({
      data: createData
    });
    const transformedCareer = {
      id: career.id,
      title: career.title,
      titleHi: career.titleHi,
      slug: career.slug,
      location: career.location,
      locationHi: career.locationHi,
      type: career.type,
      typeHi: career.typeHi,
      description: career.description,
      descriptionHi: career.descriptionHi,
      requirements: career.requirements,
      requirementsHi: career.requirementsHi,
      isActive: career.isActive,
      createdAt: career.createdAt,
      updatedAt: career.updatedAt
    };
    return withCors(NextResponse.json(transformedCareer));
  } catch (error) {
    console.error('Error creating career:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to create career' },
        { status: 500 }
      )
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return withCors(
        NextResponse.json(
          { error: 'ID is required' },
          { status: 400 }
        )
      );
    }

    const career = await prisma.career.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        slug: generateSlug(updateData.title),
        description: serializeRichText(updateData.description),
        requirements: serializeRichText(updateData.requirements)
      },
    });

    return withCors(NextResponse.json(career));
  } catch (error) {
    return withCors(
      NextResponse.json(
        { error: 'Failed to update career' },
        { status: 500 }
      )
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return withCors(
        NextResponse.json(
          { error: 'ID is required' },
          { status: 400 }
        )
      );
    }

    await prisma.career.delete({
      where: { id: parseInt(id) }
    });

    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    return withCors(
      NextResponse.json(
        { error: 'Failed to delete career' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

