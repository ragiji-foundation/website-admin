import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data instead of actual API calls
    const mockData = {
      totalBlogs: 25,
      totalCenters: 12,
      totalInitiatives: 8,
      totalCareers: 15,
      activeUsers: 1250,
      monthlyVisitors: 5000,
      pageViews: 15000,
      progress: 75
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}