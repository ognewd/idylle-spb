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
    const productDiscounts = Array.isArray(body.productDiscounts) ? body.productDiscounts : [];
    const categoryDiscounts = Array.isArray(body.categoryDiscounts) ? body.categoryDiscounts : [];
    const categoryAccessIds = Array.isArray(body.categoryAccessIds) ? body.categoryAccessIds : [];
    const brandDiscountTiers = Array.isArray(body.brandDiscountTiers) ? body.brandDiscountTiers : [];
    const categoryDiscountTiers = Array.isArray(body.categoryDiscountTiers) ? body.categoryDiscountTiers : [];
    const normalizeIntRange = (value: unknown, min: number, max: number) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return null;
      return Math.min(max, Math.max(min, Math.trunc(num)));
    };

    await prisma.$transaction(async (tx) => {
      await tx.dealerProductDiscount.deleteMany({ where: { dealerProfileId: resolved.id } });
      await tx.dealerCategoryDiscount.deleteMany({ where: { dealerProfileId: resolved.id } });
      await tx.dealerCategoryAccess.deleteMany({ where: { dealerProfileId: resolved.id } });
      await tx.dealerBrandDiscountTier.deleteMany({ where: { dealerProfileId: resolved.id } });
      await tx.dealerCategoryDiscountTier.deleteMany({ where: { dealerProfileId: resolved.id } });

      if (productDiscounts.length > 0) {
        await tx.dealerProductDiscount.createMany({
          data: productDiscounts.map((item: any) => ({
            dealerProfileId: resolved.id,
            productId: String(item.productId),
            discountPercent: Number(item.discountPercent || 0),
          })),
        });
      }

      if (categoryDiscounts.length > 0) {
        await tx.dealerCategoryDiscount.createMany({
          data: categoryDiscounts.map((item: any) => ({
            dealerProfileId: resolved.id,
            categoryId: String(item.categoryId),
            discountPercent: Number(item.discountPercent || 0),
          })),
        });
      }

      if (categoryAccessIds.length > 0) {
        await tx.dealerCategoryAccess.createMany({
          data: categoryAccessIds.map((categoryId: string) => ({
            dealerProfileId: resolved.id,
            categoryId: String(categoryId),
          })),
        });
      }

      if (brandDiscountTiers.length > 0) {
        await tx.dealerBrandDiscountTier.createMany({
          data: brandDiscountTiers
            .filter((item: any) => item?.brandId && Number(item?.minQty || 0) > 0)
            .map((item: any) => ({
              minQty: normalizeIntRange(item.minQty, 1, 99),
              maxQty: item.maxQty == null || item.maxQty === '' ? null : normalizeIntRange(item.maxQty, 1, 99),
              discountPercent: normalizeIntRange(item.discountPercent, 1, 99),
              brandId: String(item.brandId),
              dealerProfileId: resolved.id,
            }))
            .filter((item: any) => {
              if (item.minQty == null || item.discountPercent == null) return false;
              if (item.maxQty != null && item.maxQty < item.minQty) return false;
              return true;
            })
            .map((item: any) => ({
              dealerProfileId: resolved.id,
              brandId: item.brandId,
              minQty: item.minQty,
              maxQty: item.maxQty,
              discountPercent: item.discountPercent,
            })),
        });
      }

      if (categoryDiscountTiers.length > 0) {
        await tx.dealerCategoryDiscountTier.createMany({
          data: categoryDiscountTiers
            .filter((item: any) => item?.categoryId && Number(item?.minQty || 0) > 0)
            .map((item: any) => ({
              dealerProfileId: resolved.id,
              categoryId: String(item.categoryId),
              minQty: Number(item.minQty),
              maxQty: item.maxQty == null || item.maxQty === '' ? null : Number(item.maxQty),
              discountPercent: Number(item.discountPercent || 0),
            })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wholesale dealer discounts PUT error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось сохранить скидки дилера' }, { status: 500 });
  }
}

