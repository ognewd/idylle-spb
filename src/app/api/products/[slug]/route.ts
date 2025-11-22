import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
        isActive: true,
      },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        variants: {
          orderBy: [
            { isDefault: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate average rating from reviews
    const ratings = product.reviews.map(review => review.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    // Get related products (same category or brand)
    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          { id: { not: product.id } },
          {
            OR: [
              {
                productCategories: {
                  some: {
                    categoryId: {
                      in: product.productCategories.map(pc => pc.categoryId),
                    },
                  },
                },
              },
              { brandId: product.brandId },
            ],
          },
        ],
      },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
          take: 1, // Only primary image for related products
        },
      },
      take: 4,
    });

    // Load active seasonal discounts
    const now = new Date();
    const activeDiscounts = await prisma.seasonalDiscount.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        products: true,
        categories: true,
      },
    });

    // Helper to get discount for a product
    const getSeasonalForProduct = (p: typeof product) => {
      // product-specific first
      const prod = activeDiscounts.find(d => d.products.some(dp => dp.productId === p.id));
      if (prod) return { id: prod.id, name: prod.name, discount: prod.discount };
      // fallback by category (max)
      let max: { id: string; name: string; discount: number } | null = null;
      for (const pc of p.productCategories) {
        const hit = activeDiscounts.find(d => d.categories.some(dc => dc.categoryId === pc.categoryId));
        if (hit && (!max || hit.discount > max.discount)) {
          max = { id: hit.id, name: hit.name, discount: hit.discount };
        }
      }
      return max;
    };

    // Set default ratings for related products
    const relatedProductsWithRatings = relatedProducts.map(relatedProduct => ({
      ...relatedProduct,
      averageRating: 0,
      reviewCount: 0,
      price: Number(relatedProduct.price),
      comparePrice: relatedProduct.comparePrice ? Number(relatedProduct.comparePrice) : null,
    }));

    // Compute seasonal discount and discounted price for the main product
    const seasonal = getSeasonalForProduct(product);
    const basePrice = Number(product.price);
    const discountedPrice = seasonal ? Math.max(0, Math.round(basePrice * (100 - seasonal.discount) / 100)) : basePrice;

    return NextResponse.json({
      product: {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: product.reviews.length,
        price: discountedPrice,
        comparePrice: seasonal ? basePrice : (product.comparePrice ? Number(product.comparePrice) : null),
        seasonalDiscount: seasonal || null,
        images: product.images.map(img => ({
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
        })),
        variants: product.variants.map(v => ({
          id: v.id,
          name: v.name,
          value: v.value,
          price: Number(v.price),
          comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
          stock: v.stock,
          sku: v.sku,
          isDefault: v.isDefault,
        })),
        reviews: product.reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          user: r.user,
          createdAt: r.createdAt.toISOString(),
        })),
      },
      relatedProducts: relatedProductsWithRatings,
    });
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}