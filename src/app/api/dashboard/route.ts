import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAnalyticsData } from '@/utils/analytics';

export async function GET() {
  try {
    const [
      blogsCount,
      centersCount,
      initiativesCount,
      careersCount,
      analyticsData
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.center.count(),
      prisma.initiative.count(),
      prisma.career.count(),
      getAnalyticsData()
    ]);

    const monthlyVisitors = analyticsData?.sessions || 0;
    const activeUsers = analyticsData?.activeUsers || 0;
    const pageViews = analyticsData?.pageViews || 0;

    return NextResponse.json({
      totalBlogs: blogsCount,
      totalCenters: centersCount,
      totalInitiatives: initiativesCount,
      totalCareers: careersCount,
      activeUsers,
      monthlyVisitors,
      pageViews,
      progress: Math.round((centersCount + initiativesCount + blogsCount) / 30 * 100), // Adjusted progress calculation
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 