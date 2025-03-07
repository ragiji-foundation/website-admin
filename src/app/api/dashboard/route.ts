import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Content statistics
    const [
      totalBlogs,
      totalCenters,
      totalInitiatives,
      totalCareers,
      totalUsers
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.center.count(),
      prisma.initiative.count(),
      prisma.career.count(),
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
      where: { createdAt: { gte: startOfMonth } }
    });

    // Calculate content completion percentage
    const contentProgress = totalBlogs > 0
      ? Math.round((publishedBlogs / totalBlogs) * 100)
      : 0;

    // Get analytics data from our database
    // For monthly visitors, count unique visitors in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalPageViews, uniqueVisitorsThisMonth, activeSessionsToday] = await Promise.all([
      // Count total pageviews
      prisma.pageView.count(),

      // Count unique visitors in the last 30 days
      prisma.visitor.count({
        where: {
          lastVisit: { gte: thirtyDaysAgo }
        }
      }),

      // Count active sessions today (proxy for "active users")
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: {
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _count: true
      }).then(results => results.length)
    ]);

    // Monthly pageviews
    const monthlyPageViews = await prisma.pageView.count({
      where: { timestamp: { gte: thirtyDaysAgo } }
    });

    // Most popular pages
    const popularPages = await prisma.pageView.groupBy({
      by: ['path'],
      _count: {
        path: true
      },
      orderBy: {
        _count: {
          path: 'desc'
        }
      },
      take: 5
    });

    const analyticsData = {
      pageViews: totalPageViews,
      monthlyPageViews,
      monthlyVisitors: uniqueVisitorsThisMonth,
      activeUsers: activeSessionsToday,
      popularPages: popularPages.map(page => ({
        path: page.path,
        views: page._count.path
      }))
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