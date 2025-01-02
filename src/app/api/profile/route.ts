import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const profile = await prisma.user.findFirst({
      where: { email: 'admin@ragijifoundation.com' }
    });
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const profile = await prisma.user.update({
      where: { email: 'admin@ragijifoundation.com' },
      data: {
        name: data.name,
        image: data.image,
        // Add other fields as needed
      }
    });
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 