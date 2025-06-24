import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withCors, corsError } from '@/utils/cors';

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const data = await request.json();
    const stat = await prisma.stat.update({
      where: { id },
      data: {
        label: data.label,
        labelHi: data.labelHi,
        value: data.value,
        icon: data.icon,
        order: data.order,
        updatedAt: new Date()
      }
    });
    return withCors(NextResponse.json(stat));
  } catch (error) {
    return corsError('Failed to update stat');
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    await prisma.stat.delete({ where: { id } });
    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    return corsError('Failed to delete stat');
  }
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}
