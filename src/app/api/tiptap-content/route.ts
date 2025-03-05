import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    // Fetch content from database
    const content = await prisma.richTextContent.findUnique({
      where: { id },
    });

    if (!content) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { message: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, modelName, fieldName, recordId } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    if (!modelName) {
      return NextResponse.json({ message: 'Model name is required' }, { status: 400 });
    }

    if (!fieldName) {
      return NextResponse.json({ message: 'Field name is required' }, { status: 400 });
    }

    // Create new content
    const newContent = await prisma.richTextContent.create({
      data: {
        content,
        modelName,
        fieldName,
        recordId: recordId?.toString(),
      },
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { message: 'Failed to create content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, modelName, fieldName } = body;

    // Validate required fields
    if (!id || !content || !modelName || !fieldName) {
      return NextResponse.json(
        { message: 'ID, content, modelName, and fieldName are required' },
        { status: 400 }
      );
    }

    // Update existing content
    const updatedContent = await prisma.richTextContent.update({
      where: { id },
      data: { content, updatedAt: new Date() },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { message: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID is required' },
        { status: 400 }
      );
    }

    // Delete content
    await prisma.richTextContent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { message: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
