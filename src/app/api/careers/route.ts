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
  if (request.method === 'OPTIONS') {
    return corsError('CORS error');
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  try {
    // Single career fetch by slug or id
    if (slug || id) {
      const career = await prisma.career.findUnique({
        where: slug ? { slug } : { id: parseInt(id!) }
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
    }

    // List all careers
    const careers = await prisma.career.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return withCors(NextResponse.json(careers));
  } catch (error) {
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch careers' },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const slug = generateSlug(data.title);

    const career = await prisma.career.create({
      data: {
        title: data.title,
        slug,
        location: data.location,
        type: data.type,
        description: serializeRichText(data.description),
        requirements: serializeRichText(data.requirements),
        isActive: data.isActive
      }
    });
    return withCors(NextResponse.json(career));
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

