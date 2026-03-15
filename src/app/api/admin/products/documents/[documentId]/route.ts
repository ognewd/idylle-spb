import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> | { documentId: string } }
) {
  try {
    const authResult = await verifyAdminToken(_request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { documentId } = await Promise.resolve(params);
    await prisma.productDocument.delete({
      where: { id: documentId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product document DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
