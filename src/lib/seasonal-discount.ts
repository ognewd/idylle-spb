import { prisma } from '@/lib/prisma';

/**
 * Get all active seasonal discounts for given category IDs
 * @param categoryIds Array of category IDs to check
 * @returns Map of categoryId -> discount info
 */
export async function getActiveDiscountsForCategories(categoryIds: string[]): Promise<Map<string, { id: string; name: string; discount: number }>> {
  if (categoryIds.length === 0) {
    return new Map();
  }

  const now = new Date();
  
  // Find all active discounts that have any of the given categories
  const activeDiscounts = await prisma.seasonalDiscount.findMany({
    where: {
      isActive: true,
      applyTo: 'categories',
      startDate: { lte: now },
      endDate: { gte: now },
      categories: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    },
    select: {
      id: true,
      name: true,
      discount: true,
      categories: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  const discountMap = new Map();
  
  // For each discount, map all its categories
  activeDiscounts.forEach(discount => {
    discount.categories.forEach(cat => {
      if (categoryIds.includes(cat.categoryId)) {
        discountMap.set(cat.categoryId, {
          id: discount.id,
          name: discount.name,
          discount: discount.discount,
        });
      }
    });
  });

  return discountMap;
}

/**
 * Get active seasonal discount for a specific product
 * @param productId Product ID to check
 * @returns Discount info or null
 */
export async function getActiveDiscountForProduct(productId: string): Promise<{ id: string; name: string; discount: number } | null> {
  const now = new Date();
  
  const activeDiscount = await prisma.seasonalDiscount.findFirst({
    where: {
      isActive: true,
      applyTo: 'products',
      startDate: { lte: now },
      endDate: { gte: now },
      products: {
        some: {
          productId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      discount: true,
    },
  });

  return activeDiscount;
}

/**
 * Get active seasonal discounts for multiple products
 * @param productIds Array of product IDs
 * @returns Map of productId -> discount info
 */
export async function getActiveDiscountsForProducts(productIds: string[]): Promise<Map<string, { id: string; name: string; discount: number }>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const now = new Date();
  
  const activeDiscounts = await prisma.seasonalDiscount.findMany({
    where: {
      isActive: true,
      applyTo: 'products',
      startDate: { lte: now },
      endDate: { gte: now },
      products: {
        some: {
          productId: { in: productIds },
        },
      },
    },
    select: {
      id: true,
      name: true,
      discount: true,
      products: {
        where: {
          productId: { in: productIds },
        },
        select: {
          productId: true,
        },
      },
    },
  });

  const discountMap = new Map();
  
  activeDiscounts.forEach(discount => {
    discount.products.forEach(prod => {
      if (productIds.includes(prod.productId)) {
        discountMap.set(prod.productId, {
          id: discount.id,
          name: discount.name,
          discount: discount.discount,
        });
      }
    });
  });

  return discountMap;
}

/**
 * Apply seasonal discount percentage to a price
 * @param price Original price
 * @param discountPercent Discount percentage (0-100)
 * @returns Discounted price
 */
export function applySeasonalDiscount(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100);
}
