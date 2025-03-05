import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection test:', connectionTest);

    // Test direct TheNeed table operations
    const totalCount = await prisma.theNeed.count();
    console.log('Total TheNeed records:', totalCount);

    // Try creating a test record
    const testRecord = await prisma.theNeed.create({
      data: {
        mainText: 'Test main text',
        statistics: 'Test statistics',
        impact: 'Test impact',
        imageUrl: 'https://example.com/image.jpg',
        statsImageUrl: 'https://example.com/stats.jpg',
        isPublished: false,
        version: 999, // Using a high version number for test
      },
    });

    console.log('Created test record:', testRecord.id);

    // Get all records for verification
    const allRecords = await prisma.theNeed.findMany({
      select: { id: true, version: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Delete the test record
    await prisma.theNeed.delete({
      where: { id: testRecord.id },
    });

    console.log('Deleted test record');

    return NextResponse.json({
      success: true,
      connectionTest,
      totalCount,
      createdTestId: testRecord.id,
      recentRecords: allRecords,
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
