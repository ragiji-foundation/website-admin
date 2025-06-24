import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Award, AwardUpdateInput } from '@/types/award';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, context: any): Promise<NextResponse> {
  try {
    const { id } = context.params;
    const body = await req.json() as AwardUpdateInput;

    // Fetch the existing award data
    const existingAward = await prisma.award.findUnique({
      where: { id },
    });

    if (!existingAward) {
      return NextResponse.json(
        { error: 'Award not found' },
        { status: 404 }
      );
    }

    // Update the award with the provided data
    const updatedAward = await prisma.award.update({
      where: { id },
      data: {
        title: body.title,
        titleHi: body.titleHi || existingAward.titleHi || '',
        year: body.year,
        description: body.description,
        descriptionHi: body.descriptionHi || existingAward.descriptionHi || '',
        imageUrl: body.imageUrl || existingAward.imageUrl,
        organization: body.organization || existingAward.organization,
        organizationHi: body.organizationHi || existingAward.organizationHi || '',
        updatedAt: new Date()
      },
    });

    // Transform the updated award data for the response
    const transformedAward = {
      id: updatedAward.id,
      title: updatedAward.title,
      titleHi: updatedAward.titleHi,
      year: updatedAward.year,
      description: updatedAward.description,
      descriptionHi: updatedAward.descriptionHi,
      imageUrl: updatedAward.imageUrl,
      organization: updatedAward.organization,
      organizationHi: updatedAward.organizationHi,
      createdAt: updatedAward.createdAt,
      updatedAt: updatedAward.updatedAt
    };

    return NextResponse.json(transformedAward);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update award' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(
  _: NextRequest,
  context: any
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const { id } = context.params;

    await prisma.award.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete award' },
      { status: 500 }
    );
  }
}
