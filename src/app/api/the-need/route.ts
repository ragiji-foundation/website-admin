import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors } from '@/utils/cors';

export async function GET() {
  try {
    const theNeed = await prisma.theNeed.findFirst({
      select: {
        id: true,
        mainText: true,
        mainTextHi: true,
        statistics: true,
        statisticsHi: true,
        impact: true,
        impactHi: true,
        imageUrl: true,
        statsImageUrl: true,
        isPublished: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return withCors(NextResponse.json(theNeed));
  } catch (error) {
    console.error('Error fetching The Need data:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to fetch The Need data' },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const theNeed = await prisma.theNeed.create({
      data: {
        mainText: body.mainText,
        mainTextHi: body.mainTextHi || '',
        statistics: body.statistics,
        statisticsHi: body.statisticsHi || '',
        impact: body.impact,
        impactHi: body.impactHi || '',
        imageUrl: body.imageUrl,
        statsImageUrl: body.statsImageUrl,
        isPublished: body.isPublished,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return withCors(NextResponse.json(theNeed, { status: 201 }));
  } catch (error) {
    console.error('Error creating The Need data:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to create The Need data' },
        { status: 500 }
      )
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const theNeed = await prisma.theNeed.update({
      where: { id: body.id },
      data: {
        mainText: body.mainText,
        mainTextHi: body.mainTextHi || '',
        statistics: body.statistics,
        statisticsHi: body.statisticsHi || '',
        impact: body.impact,
        impactHi: body.impactHi || '',
        imageUrl: body.imageUrl,
        statsImageUrl: body.statsImageUrl,
        isPublished: body.isPublished,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });
    return withCors(NextResponse.json(theNeed));
  } catch (error) {
    console.error('Error updating The Need data:', error);
    return withCors(
      NextResponse.json(
        { error: 'Failed to update The Need data' },
        { status: 500 }
      )
    );
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

// import { withCors, corsError } from '@/utils/cors';
// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

// export async function GET() {
//   try {
//     const content = await prisma.theNeed.findFirst({
//       orderBy: { createdAt: 'desc' }
//     });
    
//     return withCors(NextResponse.json(content));
//   } catch (error) {
//     console.error('Failed to fetch content:', error);
//     return corsError('Internal server error', 500);
    
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const content = await prisma.theNeed.create({
//       data: {
//         mainText: body.mainText,
//         statistics: body.statistics,
//         impact: body.impact,
//         imageUrl: body.imageUrl,
//         statsImageUrl: body.statsImageUrl,
//         isPublished: body.isPublished
//       }
//     });
    
//     return NextResponse.json(content);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const body = await request.json();
//     const content = await prisma.theNeed.update({
//       where: { id: body.id },
//       data: {
//         mainText: body.mainText,
//         statistics: body.statistics,
//         impact: body.impact,
//         imageUrl: body.imageUrl,
//         statsImageUrl: body.statsImageUrl,
//         isPublished: body.isPublished,
//         version: { increment: 1 }
//       }
//     });
    
//     return NextResponse.json(content);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


// export async function OPTIONS() {
//   return withCors(new NextResponse(null, { status: 200 }));
// }