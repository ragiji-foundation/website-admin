import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid author ID' }, { status: 400 });
    }

    const author = await prisma.user.findUnique({
      where: { id },
      include: {
        blogs: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!author) {
      return corsError('Author not found', 404);
    }

    return withCors(NextResponse.json(author));
  } catch (error) {
    console.error('Error fetching author:', error);
    return corsError('Failed to fetch author', 500);
  }
}

export async function PUT(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid author ID' }, { status: 400 });
    }

    const data = await request.json();

    const existingAuthor = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingAuthor) {
      return corsError('Author not found', 404);
    }

    const updatedAuthor = await prisma.user.update({
      where: { id },
      data: {
        name: data.name || existingAuthor.name,
        email: data.email || existingAuthor.email,
        image: data.image !== undefined ? data.image : existingAuthor.image,
        updatedAt: new Date()
      }
    });

    return withCors(NextResponse.json(updatedAuthor));
  } catch (error) {
    console.error('Error updating author:', error);
    return corsError('Failed to update author', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid author ID' }, { status: 400 });
    }

    const existingAuthor = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogs: true
          }
        }
      }
    });

    if (!existingAuthor) {
      return corsError('Author not found', 404);
    }

    // Check if author has blogs
    if (existingAuthor._count.blogs > 0) {
      return corsError('Cannot delete author with existing blogs', 400);
    }

    await prisma.user.delete({
      where: { id }
    });

    return withCors(NextResponse.json({ message: 'Author deleted successfully' }));
  } catch (error) {
    console.error('Error deleting author:', error);
    return corsError('Failed to delete author', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}