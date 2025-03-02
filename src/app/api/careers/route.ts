import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function GET() {
  try {
    const careers = await prisma.career.findMany({
      orderBy: { createdAt: 'desc' },
      where: { isActive: true }
    });
    return withCors(NextResponse.json(careers));
  } catch (error) {
    console.error('Error fetching careers:', error);
    return corsError('Failed to fetch careers');
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const career = await prisma.career.create({
      data: {
        title: data.title,
        location: data.location,
        type: data.type,
        description: data.description,
        requirements: data.requirements,
        isActive: true
      }
    });
    return NextResponse.json(career);
  } catch (error) {
    console.error('Error creating career:', error);
    return NextResponse.json(
      { error: 'Failed to create career' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}