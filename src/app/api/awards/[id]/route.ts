import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Award, AwardUpdateInput } from '@/types/award';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, context: any): Promise<NextResponse> {
  try {
    const { id } = context.params;
    const body = await req.json() as AwardUpdateInput;
    const award = await prisma.award.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(award);
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
