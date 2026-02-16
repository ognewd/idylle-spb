import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/image-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    // Поддержка как синхронных, так и асинхронных params (Next.js 14/15)
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;
    
    let product = await prisma.product.findUnique({
      where: { slug },
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
      },
    });

    // Fallback: ищем по артикулу (manufacturerSku/sku), если slug не совпал
    let canonicalSlug: string | undefined;
    if (!product) {
      const artMatch = params.slug.match(/-art-([a-zA-Z0-9_-]+)$/i);
      let code: string | null = artMatch ? artMatch[1].trim() : null;
      if (!code) {
        const last = params.slug.split('-').pop();
        if (last && /^[a-zA-Z0-9]{6,}$/.test(last)) code = last;
      }
      if (code) {
        const fallback = await prisma.product.findFirst({
          where: {
            isActive: true,
            OR: [
              { manufacturerSku: { equals: code, mode: 'insensitive' } },
              { manufacturerSku: { contains: code, mode: 'insensitive' } },
              { sku: { equals: code, mode: 'insensitive' } },
              { sku: { contains: code, mode: 'insensitive' } },
            ],
          },
          include: {
            brand: true,
            productCategories: { include: { category: true } },
            images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            variants: { orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }] },
          },
        });
        if (fallback) {
          product = fallback;
          canonicalSlug = product.slug;
        }
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product not found', inactive: true },
        { status: 404 }
      );
    }

    // Отзывы — отдельным запросом; только одобренные, исключаем userId=null (битые данные)
    type ReviewWithUser = { id: string; rating: number; title: string | null; comment: string | null; createdAt: Date; user: { name: string | null } };
    let reviews: ReviewWithUser[] = [];
    try {
      const rows = await prisma.review.findMany({
        where: {
          productId: product.id,
          isApproved: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId: { not: null } as any,
        },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      reviews = rows as unknown as ReviewWithUser[];
    } catch {
      reviews = [];
    }

    const ratings = reviews.map(review => review.rating);
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

    // Получаем origin из запроса для правильного формирования URL изображений
    let requestOrigin = 'https://aromarussia.ru'; // fallback
    try {
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'aromarussia.ru';
      // Определяем протокол: для localhost используем http, иначе берем из заголовка или используем https
      const proto = host.includes('localhost') || host.includes('127.0.0.1')
        ? 'http'
        : (request.headers.get('x-forwarded-proto') || 'https');
      requestOrigin = `${proto}://${host}`;
    } catch (error) {
      console.error('Error getting request origin:', error);
    }

    // Логируем количество изображений для отладки
    console.log(`[API Products/${slug}] Product "${product.name}": Found ${product.images.length} images in DB:`, 
      product.images.map(img => ({ url: img.url, isPrimary: img.isPrimary, sortOrder: img.sortOrder }))
    );

    const body = {
      product: {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
        price: discountedPrice,
        comparePrice: seasonal ? basePrice : (product.comparePrice ? Number(product.comparePrice) : null),
        seasonalDiscount: seasonal || null,
        weight: product.weight ? Number(product.weight) : null,
        images: product.images.map(img => {
          // Используем getImageUrl для всех путей, включая /uploads/
          // На localhost это сформирует полный URL, на проде - относительный (для Nginx)
          const imageUrl = getImageUrl(img.url, { baseUrl: requestOrigin });
          return {
            url: imageUrl,
            alt: img.alt,
            isPrimary: img.isPrimary,
          };
        }),
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
        reviews: reviews.map(r => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          user: {
            name: r.user?.name ?? 'Анонимный пользователь',
          },
          createdAt: r.createdAt.toISOString(),
        })),
      },
      relatedProducts: relatedProductsWithRatings.map(relatedProduct => ({
        ...relatedProduct,
        images: relatedProduct.images.map(img => {
          // Используем getImageUrl для всех путей, включая /uploads/
          // На localhost это сформирует полный URL, на проде - относительный (для Nginx)
          const imageUrl = getImageUrl(img.url, { baseUrl: requestOrigin });
          return {
            url: imageUrl,
            alt: img.alt,
            isPrimary: img.isPrimary,
          };
        }),
      })),
      ...(canonicalSlug && { canonicalSlug }),
    };
    return NextResponse.json(body);
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}