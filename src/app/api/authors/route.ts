import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const authors = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            blogs: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const authorsWithCount = authors.map(author => ({
      ...author,
      blogCount: author._count.blogs
    }));

    return withCors(NextResponse.json(authorsWithCount));
  } catch (error) {
    console.error('Error fetching authors:', error);
    return corsError('Failed to fetch authors', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Generate username from email if not provided
    const username = data.username || data.email.split('@')[0];

    const author = await prisma.user.create({
      data: {
        name: data.name,
        username: username,
        email: data.email,
        image: data.image || null,
        role: data.role || 'author',
        password: data.password || 'temporary', // You might want to hash this
      }
    });

    return withCors(NextResponse.json(author, { status: 201 }));
  } catch (error) {
    console.error('Error creating author:', error);
    return corsError('Failed to create author', 500);
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}