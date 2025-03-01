import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const awards = await prisma.award.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(awards);
  } catch (error) {
    console.error('Error fetching awards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch awards' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const award = await prisma.award.create({ data: body });
    return NextResponse.json(award);
  } catch (error) {
    console.error('Error creating award:', error);
    return NextResponse.json(
      { error: 'Failed to create award' },
      { status: 500 }
    );
  }
}