import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';



export async function GET(
  _request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const application = await prisma.joinApplication.findUnique({
      where: { id: context.params.id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const data = await request.json();
    const { status } = data;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'CONTACTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const application = await prisma.joinApplication.update({
      where: { id: context.params.id },
      data: {
        status,
        updatedAt: new Date()
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    await prisma.joinApplication.delete({
      where: { id: context.params.id }
    });

    return NextResponse.json(
      { message: 'Application deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
