import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Replace this with your actual data fetching logic
    const dashboardData = {
      totalBlogs: 10,
      totalCenters: 5,
      totalInitiatives: 8,
      totalCareers: 3,
      activeUsers: 150,
      monthlyVisitors: 1000,
      pageViews: 5000,
      progress: 75
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}