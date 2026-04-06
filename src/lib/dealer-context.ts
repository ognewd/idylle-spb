import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/admin-auth';

export interface DealerContext {
  dealerProfileId: string;
  allowedBrandIds: string[];
  allowedCategoryIds: string[];
  brandDiscountByBrandId: Record<string, number>;
  productDiscountByProductId: Record<string, number>;
  categoryDiscountByCategoryId: Record<string, number>;
}

export async function getDealerContextFromRequest(request: NextRequest): Promise<DealerContext | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const secret = getJwtSecret();
  if (!secret) return null;

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, secret) as any;
    if (decoded.activeMode !== 'dealer' || !decoded.dealerProfileId) return null;

    const dealer = await prisma.dealerProfile.findUnique({
      where: { id: decoded.dealerProfileId as string },
      include: {
        brandAccesses: true,
        categoryAccesses: true,
        productDiscounts: true,
        categoryDiscounts: true,
      },
    });
    if (!dealer || dealer.status !== 'active') return null;

    const allowedBrandIds = dealer.brandAccesses.map((x) => x.brandId);
    const allowedCategoryIds = dealer.categoryAccesses.map((x) => x.categoryId);
    const brandDiscountByBrandId: Record<string, number> = {};
    const productDiscountByProductId: Record<string, number> = {};
    const categoryDiscountByCategoryId: Record<string, number> = {};

    dealer.brandAccesses.forEach((x) => { brandDiscountByBrandId[x.brandId] = Number(x.discountPercent); });
    dealer.productDiscounts.forEach((x) => { productDiscountByProductId[x.productId] = Number(x.discountPercent); });
    dealer.categoryDiscounts.forEach((x) => { categoryDiscountByCategoryId[x.categoryId] = Number(x.discountPercent); });

    return {
      dealerProfileId: dealer.id,
      allowedBrandIds,
      allowedCategoryIds,
      brandDiscountByBrandId,
      productDiscountByProductId,
      categoryDiscountByCategoryId,
    };
  } catch {
    return null;
  }
}

export function getDealerDiscountPercent(args: {
  productId: string;
  brandId: string;
  categoryIds: string[];
  brandDiscountByBrandId: Record<string, number>;
  productDiscountByProductId: Record<string, number>;
  categoryDiscountByCategoryId: Record<string, number>;
}): number {
  const productDiscount = args.productDiscountByProductId[args.productId] ?? null;
  if (productDiscount != null) return productDiscount;
  const brandDiscount = args.brandDiscountByBrandId[args.brandId] ?? null;
  if (brandDiscount != null) return brandDiscount;
  let categoryDiscount = 0;
  for (const categoryId of args.categoryIds) {
    const v = args.categoryDiscountByCategoryId[categoryId];
    if (v != null && v > categoryDiscount) categoryDiscount = v;
  }
  return categoryDiscount;
}

