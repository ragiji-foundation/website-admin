import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: data,
      create: data,
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 