import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors } from '@/utils/cors';

export async function GET() {
  try {
    // Test database connection first
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection test:', dbTest);

    // Get the latest version of TheNeed content
    const theNeed = await prisma.theNeed.findFirst({
      orderBy: {
        version: 'desc',
      },
    });

    console.log('Fetched TheNeed:', theNeed ? 'ID: ' + theNeed.id : 'No data found');
    return withCors(NextResponse.json(theNeed || {}));
  } catch (error) {
    console.error('Error fetching TheNeed:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch TheNeed: ' + (error instanceof Error ? error.message : String(error)) },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('TheNeed POST request received');
    let data;

    try {
      const bodyText = await request.text();
      console.log('Request body:', bodyText);

      try {
        data = JSON.parse(bodyText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return withCors(NextResponse.json({
          error: 'Invalid JSON: ' + (parseError instanceof Error ? parseError.message : String(parseError))
        }, { status: 400 }));
      }
    } catch (e) {
      console.error('Failed to read request body:', e);
      return withCors(NextResponse.json({
        error: 'Failed to read request body: ' + (e instanceof Error ? e.message : String(e))
      }, { status: 400 }));
    }

    console.log('Received TheNeed data:', {
      hasId: !!data.id,
      mainTextLength: data.mainText?.length || 0,
      statisticsLength: data.statistics?.length || 0,
      impactLength: data.impact?.length || 0,
      hasImageUrl: !!data.imageUrl,
      hasStatsImageUrl: !!data.statsImageUrl,
      isPublished: !!data.isPublished
    });

    // Validate required fields
    const requiredFields = [
      { field: 'mainText', value: data.mainText },
      { field: 'statistics', value: data.statistics },
      { field: 'impact', value: data.impact },
      { field: 'imageUrl', value: data.imageUrl },
      { field: 'statsImageUrl', value: data.statsImageUrl }
    ];

    for (const { field, value } of requiredFields) {
      if (!value) {
        console.error(`Missing required field: ${field}`);
        return withCors(NextResponse.json({ error: `${field} is required` }, { status: 400 }));
      }
    }

    // Get the latest version number
    const latestTheNeed = await prisma.theNeed.findFirst({
      orderBy: { version: 'desc' },
    });

    const nextVersion = latestTheNeed ? latestTheNeed.version + 1 : 1;
    console.log('Next version will be:', nextVersion);

    try {
      // Create new TheNeed record
      console.log('Creating TheNeed record with data:', {
        mainText: data.mainText.substring(0, 50) + '...',
        statistics: data.statistics.substring(0, 50) + '...',
        impact: data.impact.substring(0, 50) + '...',
        imageUrl: data.imageUrl,
        statsImageUrl: data.statsImageUrl,
        isPublished: Boolean(data.isPublished),
        version: nextVersion
      });

      const theNeed = await prisma.theNeed.create({
        data: {
          mainText: data.mainText,
          statistics: data.statistics,
          impact: data.impact,
          imageUrl: data.imageUrl,
          statsImageUrl: data.statsImageUrl,
          isPublished: Boolean(data.isPublished),
          version: nextVersion,
        },
      });

      console.log('Successfully created TheNeed with ID:', theNeed.id);
      return withCors(NextResponse.json(theNeed, { status: 201 }));
    } catch (dbError) {
      console.error('Database error creating TheNeed:', dbError);
      return withCors(NextResponse.json(
        { error: 'Database error: ' + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500 }
      ));
    }
  } catch (error) {
    console.error('Uncaught error in POST handler:', error);
    return withCors(NextResponse.json(
      { error: 'Failed to create TheNeed: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    ));
  }
}

export async function PUT(request: NextRequest) {
  try {
    let data;
    try {
      data = await request.json();
    } catch (e) {
      console.error('Failed to parse request body as JSON', e);
      return withCors(NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }));
    }

    console.log('Received data for PUT:', {
      id: data.id,
      mainTextLength: data.mainText?.length || 0,
      statisticsLength: data.statistics?.length || 0,
      impactLength: data.impact?.length || 0,
    });

    if (!data.id) {
      return withCors(NextResponse.json({ error: 'ID is required' }, { status: 400 }));
    }

    // Validate required fields
    if (!data.mainText || !data.statistics || !data.impact || !data.imageUrl || !data.statsImageUrl) {
      return withCors(NextResponse.json({ error: 'All fields are required' }, { status: 400 }));
    }

    // Get the current version
    const currentTheNeed = await prisma.theNeed.findUnique({
      where: { id: data.id },
    });

    if (!currentTheNeed) {
      return withCors(NextResponse.json({ error: 'TheNeed not found' }, { status: 404 }));
    }

    try {
      // Update with new version
      const theNeed = await prisma.theNeed.update({
        where: { id: data.id },
        data: {
          mainText: data.mainText,
          statistics: data.statistics,
          impact: data.impact,
          imageUrl: data.imageUrl,
          statsImageUrl: data.statsImageUrl,
          isPublished: !!data.isPublished, // Ensure it's a boolean
          version: currentTheNeed.version + 1,
        },
      });

      console.log('Successfully updated TheNeed:', theNeed.id);
      return withCors(NextResponse.json(theNeed));
    } catch (dbError) {
      console.error('Database error updating TheNeed:', dbError);
      return withCors(NextResponse.json(
        { error: 'Database error: ' + (dbError instanceof Error ? dbError.message : 'Unknown error') },
        { status: 500 }
      ));
    }
  } catch (error) {
    console.error('Error handling PUT request:', error);
    return withCors(NextResponse.json(
      { error: 'Failed to update TheNeed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}