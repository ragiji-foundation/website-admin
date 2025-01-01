import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test the connection
    await prisma.$connect();

    // Try a simple query
    const count = await prisma.career.count();

    return NextResponse.json({
      status: 'Connected',
      count,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'Error',
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 