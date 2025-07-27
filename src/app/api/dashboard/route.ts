import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface DashboardData {
  totalBlogs: number;
  totalCenters: number;
  totalInitiatives: number;
  totalCareers: number;
  activeUsers: number;
  monthlyVisitors: number;
  pageViews: number;
  progress: number;
}

// Cache for dashboard data
let cachedDashboardData: DashboardData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Prevent duplicate requests
let ongoingRequest: Promise<DashboardData> | null = null;

export async function GET() {
  try {
    // Return cached data if still valid
    if (cachedDashboardData && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json(cachedDashboardData);
    }

    // If there's an ongoing request, wait for it instead of making a new one
    if (ongoingRequest) {
      const data = await ongoingRequest;
      return NextResponse.json(data);
    }

    // Create new request
    ongoingRequest = fetchDashboardDataInternal();
    
    try {
      const data = await ongoingRequest;
      return NextResponse.json(data);
    } finally {
      ongoingRequest = null; // Clear ongoing request
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return fallback data if cache exists and error occurs
    if (cachedDashboardData) {
      return NextResponse.json(cachedDashboardData);
    }
    
    return NextResponse.json(
      { 
        totalBlogs: 0,
        totalCenters: 0,
        totalInitiatives: 0,
        totalCareers: 0,
        activeUsers: 0,
        monthlyVisitors: 0,
        pageViews: 0,
        progress: 0
      },
      { status: 200 } // Return 200 with fallback data instead of 500
    );
  }
}

async function fetchDashboardDataInternal(): Promise<DashboardData> {
  try {
    // Use standard Prisma queries instead of raw SQL to avoid type issues
    const [
      totalBlogs,
      publishedBlogs,
      totalCenters,
      totalInitiatives,
      totalCareers,
      totalUsers,
      totalPageViews,
      monthlyPageViews,
      monthlyVisitors,
      activeUsers
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { status: 'PUBLISHED' } }),
      prisma.center.count(),
      prisma.initiative.count(),
      prisma.career.count(),
      prisma.user.count(),
      
      // Analytics queries with safe fallbacks
      prisma.pageView.count().catch(() => 0),
      prisma.pageView.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      }).catch(() => 0),
      prisma.visitor.count({
        where: {
          lastVisit: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      }).catch(() => 0),
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: {
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today start
          }
        }
      }).then(result => result.length).catch(() => 0)
    ]);

    // Calculate content completion percentage
    const contentProgress = totalBlogs > 0 
      ? Math.round((publishedBlogs / totalBlogs) * 100) 
      : 0;

    const dashboardData = {
      totalBlogs,
      totalCenters,
      totalInitiatives,
      totalCareers,
      activeUsers,
      monthlyVisitors,
      pageViews: totalPageViews,
      progress: contentProgress
    };

    // Cache the result
    cachedDashboardData = dashboardData;
    cacheTimestamp = Date.now();

    return dashboardData;
  } catch (error) {
    console.error('Error in fetchDashboardDataInternal:', error);
    // Return safe fallback data
    return {
      totalBlogs: 0,
      totalCenters: 0,
      totalInitiatives: 0,
      totalCareers: 0,
      activeUsers: 0,
      monthlyVisitors: 0,
      pageViews: 0,
      progress: 0
    };
  }
}