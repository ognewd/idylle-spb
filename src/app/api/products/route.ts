import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/image-url';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    
    // Get filter parameters (support multiple values)
    const getFilterValues = (paramName: string) => {
      const value = searchParams.get(paramName);
      return value ? value.split(',').map(v => v.trim()).filter(v => v) : [];
    };
    
    const categories = getFilterValues('filter_category');
    const brands = getFilterValues('filter_brand');
    const genders = getFilterValues('filter_gender');
    const aromaFamilies = getFilterValues('filter_aromaFamily');
    const productTypes = getFilterValues('filter_productType');
    const purposes = getFilterValues('filter_purpose');
    const countries = getFilterValues('filter_country');
    const volumes = getFilterValues('filter_volume');
    
    // Legacy support for single values
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const gender = searchParams.get('gender');
    const aromaFamily = searchParams.get('aromaFamily');
    
    // Слайдер в ProductFilters задаёт filter_price_*; minPrice/maxPrice — совместимость
    const minPrice =
      searchParams.get('minPrice') ?? searchParams.get('filter_price_min');
    const maxPrice =
      searchParams.get('maxPrice') ?? searchParams.get('filter_price_max');
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      isActive: true,
    };

    // Add filters (support multiple values)
    if (categories.length > 0) {
      where.productCategories = {
        some: {
          category: {
            slug: {
              in: categories,
            },
          },
        },
      };
    } else if (category) {
      // Legacy support for single category
      where.productCategories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    if (brands.length > 0) {
      where.brand = {
        slug: {
          in: brands,
        },
      };
    } else if (brand) {
      // Legacy support for single brand
      where.brand = {
        slug: brand,
      };
    }

    if (genders.length > 0) {
      where.gender = {
        in: genders,
      };
    } else if (gender) {
      // Legacy support for single gender
      where.gender = gender;
    }

    if (aromaFamilies.length > 0) {
      where.aromaFamily = {
        in: aromaFamilies,
        mode: 'insensitive',
      };
    } else if (aromaFamily) {
      // Legacy support for single aroma family
      where.aromaFamily = {
        contains: aromaFamily,
        mode: 'insensitive',
      };
    }

    if (productTypes.length > 0) {
      where.productType = {
        in: productTypes,
        mode: 'insensitive',
      };
    }

    // Назначение: в БД хранится строка через запятую (например "Гостиная, столовая"); фильтр по вхождению токена
    if (purposes.length > 0) {
      const purposeConditions = purposes.flatMap(p => [
        { purpose: { equals: p, mode: 'insensitive' as const } },
        { purpose: { startsWith: p + ',', mode: 'insensitive' as const } },
        { purpose: { startsWith: p + ', ', mode: 'insensitive' as const } },
        { purpose: { endsWith: ',' + p, mode: 'insensitive' as const } },
        { purpose: { endsWith: ', ' + p, mode: 'insensitive' as const } },
        { purpose: { contains: ',' + p + ',', mode: 'insensitive' as const } },
        { purpose: { contains: ', ' + p + ',', mode: 'insensitive' as const } },
        { purpose: { contains: ',' + p + ', ', mode: 'insensitive' as const } },
        { purpose: { contains: ', ' + p + ', ', mode: 'insensitive' as const } },
      ]);
      where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: purposeConditions }];
    }

    if (countries.length > 0) {
      where.country = {
        in: countries,
        mode: 'insensitive',
      };
    }

    if (volumes.length > 0) {
      where.volume = {
        in: volumes,
        mode: 'insensitive',
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturerSku: { contains: search, mode: 'insensitive' } },
        { aromaDescription: { contains: search, mode: 'insensitive' } },
        { topNotes: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'featured':
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
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
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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

    // Build productId -> discount map
    const productIdToDiscount = new Map<string, { id: string; name: string; discount: number }>();
    for (const d of activeDiscounts) {
      for (const p of d.products) {
        productIdToDiscount.set(p.productId, { id: d.id, name: d.name, discount: d.discount });
      }
    }
    // Also map categories
    const categoryIdToDiscounts = new Map<string, { id: string; name: string; discount: number }[]>();
    for (const d of activeDiscounts) {
      for (const c of d.categories) {
        const arr = categoryIdToDiscounts.get(c.categoryId) || [];
        arr.push({ id: d.id, name: d.name, discount: d.discount });
        categoryIdToDiscounts.set(c.categoryId, arr);
      }
    }

    // Базовый URL из запроса (учитываем прокси: x-forwarded-proto/host), чтобы картинки в каталоге вели на текущий домен
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

    // Calculate average ratings and apply seasonal discounts to price
    const productsWithRatings = products.map(product => {
      // Пока нет отзывов, устанавливаем рейтинг 0
      const averageRating = 0;
      const reviewCount = 0;
      // Determine seasonal discount (product-specific has priority, otherwise by category, take max)
      let seasonal: { id: string; name: string; discount: number } | null =
        productIdToDiscount.get(product.id) || null;
      if (!seasonal) {
        let maxCat: { id: string; name: string; discount: number } | null = null;
        for (const pc of product.productCategories) {
          const arr = categoryIdToDiscounts.get(pc.categoryId);
          if (arr && arr.length > 0) {
            for (const s of arr) {
              if (!maxCat || s.discount > maxCat.discount) maxCat = s;
            }
          }
        }
        seasonal = maxCat;
      }
      // Apply discount to numeric price for display
      const basePrice = Number(product.price);
      const discountedPrice = seasonal ? Math.max(0, Math.round(basePrice * (100 - seasonal.discount) / 100)) : basePrice;

      return {
        ...product,
        averageRating: averageRating,
        reviewCount: reviewCount,
        price: discountedPrice,
        comparePrice: seasonal ? basePrice : (product.comparePrice ? Number(product.comparePrice) : null),
        seasonalDiscount: seasonal || null,
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
      };
    });

    return NextResponse.json({
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
