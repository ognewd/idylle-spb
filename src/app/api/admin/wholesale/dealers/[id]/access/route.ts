import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function PUT(
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
    const accesses = Array.isArray(body.accesses) ? body.accesses : [];

    await prisma.$transaction(async (tx) => {
      await tx.dealerBrandAccess.deleteMany({ where: { dealerProfileId: resolved.id } });
      if (accesses.length > 0) {
        await tx.dealerBrandAccess.createMany({
          data: accesses.map((item: any) => ({
            dealerProfileId: resolved.id,
            brandId: String(item.brandId),
            discountPercent: Number(item.discountPercent || 0),
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wholesale dealer access PUT error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось сохранить доступ к брендам' }, { status: 500 });
  }
}

