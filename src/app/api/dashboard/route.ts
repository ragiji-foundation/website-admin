import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch aggregate data from database using Prisma
    const [
      totalBlogs,
      totalCenters,
      totalInitiatives,
      totalCareers,
      totalUsers
    ] = await Promise.all([
      // Count total blogs
      prisma.blog.count(),

      // Count total centers
      prisma.center.count(),

      // Count total initiatives
      prisma.initiative.count(),

      // Count total careers/job openings
      prisma.career.count(),

      // Count total users
      prisma.user.count()
    ]);

    // Get published blogs count
    const publishedBlogs = await prisma.blog.count({
      where: { status: 'published' }
    });

    // Get blogs created in the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const blogsThisMonth = await prisma.blog.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Calculate content completion percentage
    // Formula: (published blogs / total blogs) * 100
    const contentProgress = totalBlogs > 0
      ? Math.round((publishedBlogs / totalBlogs) * 100)
      : 0;

    // For analytics data like pageViews and visitors,
    // you would typically integrate with an analytics service
    // Here we're using placeholder values
    const analyticsData = {
      activeUsers: 150, // Replace with actual analytics data if available
      monthlyVisitors: 1000, // Replace with actual analytics data if available
      pageViews: 5000 // Replace with actual analytics data if available
    };

    const dashboardData = {
      totalBlogs,
      publishedBlogs,
      blogsThisMonth,
      totalCenters,
      totalInitiatives,
      totalCareers,
      totalUsers,
      contentProgress,
      ...analyticsData
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}