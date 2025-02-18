import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Replace this with your actual database query
    const contents = [
      {
        id: '1',
        title: 'Sample Image 1',
        thumbnail: '/images/sample1-thumb.jpg',
        type: 'Image',
        url: '/images/sample1.jpg'
      },
      {
        id: '2',
        title: 'Sample Image 2',
        thumbnail: '/images/sample2-thumb.jpg',
        type: 'Image',
        url: '/images/sample2.jpg'
      }
    ];

    return NextResponse.json(contents);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch content library' },
      { status: 500 }
    );
  }
}