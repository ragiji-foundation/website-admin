import { NextResponse } from 'next/server';
import { mockSuccessStories } from '@/data/mock-success-stories';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // In a real app, you'd query a database for this specific story by slug
    // For now, we'll modify the mock data to have slugs
    const story = mockSuccessStories.find(story =>
      // Convert title to slug for demo purposes - in real app, you'd have a dedicated slug field
      story.slug === slug ||
      story.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') === slug
    );

    if (!story) {
      return NextResponse.json(
        { error: 'Success story not found' },
        { status: 404 }
      );
    }

    // Add artificial delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(story);
  } catch (error) {
    console.error(`Error fetching success story with slug ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch success story' },
      { status: 500 }
    );
  }
}
