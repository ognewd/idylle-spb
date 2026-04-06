import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const resolved = await Promise.resolve(params);
    const body = await request.json();
    const status = typeof body.status === 'string' ? body.status : '';
    const managerNote = typeof body.managerNote === 'string' ? body.managerNote : null;
    if (!['new', 'in_review', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Некорректный статус' }, { status: 400 });
    }

    const updated = await prisma.dealerRequest.update({
      where: { id: resolved.id },
      data: { status, managerNote },
    });
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error('Wholesale request PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось обновить заявку' }, { status: 500 });
  }
}

