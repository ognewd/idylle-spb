import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const resolved = await Promise.resolve(params);
    const dealer = await prisma.dealerProfile.findUnique({
      where: { id: resolved.id },
      include: {
        users: {
          where: { role: 'dealer' },
          select: { id: true, name: true, email: true, phone: true, isActive: true, role: true, roles: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        brandAccesses: { include: { brand: true } },
        categoryAccesses: { include: { category: true } },
        productDiscounts: { include: { product: { select: { id: true, name: true } } } },
        categoryDiscounts: { include: { category: { select: { id: true, name: true } } } },
        brandDiscountTiers: { include: { brand: { select: { id: true, name: true } } }, orderBy: [{ brandId: 'asc' }, { minQty: 'asc' }] },
        categoryDiscountTiers: { include: { category: { select: { id: true, name: true } } }, orderBy: [{ categoryId: 'asc' }, { minQty: 'asc' }] },
      },
    });
    if (!dealer) {
      return NextResponse.json({ success: false, error: 'Дилер не найден' }, { status: 404 });
    }
    return NextResponse.json({ success: true, dealer });
  } catch (error) {
    console.error('Wholesale dealer GET error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось получить дилера' }, { status: 500 });
  }
}

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
    const { companyName, contacts, requisites, status, brandIds, brandDiscounts } = body;

    if (brandIds !== undefined) {
      const normalizedDiscounts = new Map<string, number>();
      if (Array.isArray(brandDiscounts)) {
        for (const row of brandDiscounts) {
          const brandId = String(row?.brandId || '');
          if (!brandId) continue;
          const raw = Number(row?.discountPercent ?? 1);
          const discountPercent = Math.max(1, Math.min(99, Number.isFinite(raw) ? raw : 1));
          normalizedDiscounts.set(brandId, discountPercent);
        }
      }

      await prisma.dealerBrandAccess.deleteMany({ where: { dealerProfileId: resolved.id } });
      if (brandIds.length > 0) {
        await prisma.dealerBrandAccess.createMany({
          data: brandIds.map((brandId: string) => ({
            dealerProfileId: resolved.id,
            brandId,
            discountPercent: normalizedDiscounts.get(brandId) ?? 1,
          })),
        });
      }
    }

    const updated = await prisma.dealerProfile.update({
      where: { id: resolved.id },
      data: {
        companyName: companyName ?? undefined,
        contacts: contacts ?? undefined,
        requisites: requisites ?? undefined,
        status: status ?? undefined,
      },
    });
    return NextResponse.json({ success: true, dealer: updated });
  } catch (error) {
    console.error('Wholesale dealer PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось обновить дилера' }, { status: 500 });
  }
}

