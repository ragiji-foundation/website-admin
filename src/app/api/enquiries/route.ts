import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
'Access-Control-Allow-Origin': '*',

      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      enquiries,
      {
        headers: {
'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enquiries' },
      {
        status: 500,
        headers: {
       'Access-Control-Allow-Origin': '*',
          
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
} 