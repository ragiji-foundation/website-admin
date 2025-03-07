import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import  cookies  from 'next/headers';

// Function to parse user agent
function parseUserAgent(userAgent: string) {
  // Simple parsing logic, could be expanded
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);

  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'IE';

  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'MacOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  let device = 'Desktop';
  if (isMobile) device = 'Mobile';
  if (isTablet) device = 'Tablet';

  return { browser, os, device };
}

// Helper function to parse cookies from a cookie header
function parseCookies(cookieHeader: string) {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { path, referrer } = data;

    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown';

    // Get cookies from request header instead of using cookies() API
    const cookieHeader = request.headers.get('cookie') || '';
    const parsedCookies = parseCookies(cookieHeader);

    let visitorId = parsedCookies['visitor_id'];
    let sessionId = parsedCookies['session_id'];

    const response = NextResponse.json({ success: true });

    // If visitor ID doesn't exist, create it and set cookie
    if (!visitorId) {
      visitorId = uuidv4();
      response.cookies.set('visitor_id', visitorId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });
    }

    // If session ID doesn't exist or we need to refresh it, create/update it
    if (!sessionId) {
      sessionId = uuidv4();
      response.cookies.set('session_id', sessionId, {
        path: '/',
        maxAge: 60 * 30, // 30 minutes
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });
    }

    // Parse user agent
    const { browser, os, device } = parseUserAgent(userAgent);

    // Record page view
    await prisma.pageView.create({
      data: {
        path,
        referrer,
        userAgent,
        ipAddress: ip,
        sessionId,
        visitorId
      }
    });

    // Update or create visitor record
    await prisma.visitor.upsert({
      where: { id: visitorId },
      update: {
        lastVisit: new Date(),
        visitCount: { increment: 1 }
      },
      create: {
        id: visitorId,
        browser,
        operatingSystem: os,
        device
      }
    });

    return response;
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}
