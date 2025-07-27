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
  // Optimize: Use raw SQL for better performance on counts
  const contentCounts = await prisma.$queryRaw`
    SELECT 
      (SELECT COUNT(*)::int FROM "Blog") as total_blogs,
      (SELECT COUNT(*)::int FROM "Blog" WHERE status = 'published') as published_blogs,
      (SELECT COUNT(*)::int FROM "Center") as total_centers,
      (SELECT COUNT(*)::int FROM "Initiative") as total_initiatives,
      (SELECT COUNT(*)::int FROM "Career") as total_careers,
      (SELECT COUNT(*)::int FROM "users") as total_users
  `;

  const counts = Array.isArray(contentCounts) ? contentCounts[0] : contentCounts;

  // Get 30 days ago for analytics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get today start for active sessions
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Combined analytics query - single database hit
  const analyticsData = await prisma.$queryRaw`
    SELECT 
      (SELECT COUNT(*)::int FROM "PageView") as total_page_views,
      (SELECT COUNT(*)::int FROM "PageView" WHERE timestamp >= ${thirtyDaysAgo}) as monthly_page_views,
      (SELECT COUNT(*)::int FROM "Visitor" WHERE "lastVisit" >= ${thirtyDaysAgo}) as monthly_visitors,
      (SELECT COUNT(DISTINCT "sessionId")::int FROM "PageView" WHERE timestamp >= ${todayStart}) as active_users
  `;

  const analytics = Array.isArray(analyticsData) ? analyticsData[0] : analyticsData;

  // Calculate content completion percentage
  const totalBlogs = Number(counts.total_blogs) || 0;
  const publishedBlogs = Number(counts.published_blogs) || 0;
  const contentProgress = totalBlogs > 0 
    ? Math.round((publishedBlogs / totalBlogs) * 100) 
    : 0;

  const dashboardData = {
    totalBlogs,
    totalCenters: Number(counts.total_centers) || 0,
    totalInitiatives: Number(counts.total_initiatives) || 0,
    totalCareers: Number(counts.total_careers) || 0,
    activeUsers: Number(analytics.active_users) || 0,
    monthlyVisitors: Number(analytics.monthly_visitors) || 0,
    pageViews: Number(analytics.total_page_views) || 0,
    progress: contentProgress
  };

  // Cache the result
  cachedDashboardData = dashboardData;
  cacheTimestamp = Date.now();

  return dashboardData;
}