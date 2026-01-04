import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Конфигурация кеширования для Next.js App Router
export const revalidate = 60; // Кешировать на 60 секунд
export const dynamic = 'force-dynamic'; // Переопределяем для API routes

// Кеширование для сезонных скидок (1 минута)
let cachedDiscounts: {
  data: any[];
  productIdMap: Map<string, { id: string; name: string; discount: number }>;
  categoryIdMap: Map<string, { id: string; name: string; discount: number }[]>;
  timestamp: number;
} | null = null;

const DISCOUNT_CACHE_TTL = 60 * 1000; // 1 минута

async function getCachedDiscounts() {
  const now = Date.now();
  if (cachedDiscounts && (now - cachedDiscounts.timestamp) < DISCOUNT_CACHE_TTL) {
    return cachedDiscounts;
  }

  try {
    const nowDate = new Date();
    const activeDiscounts = await prisma.seasonalDiscount.findMany({
      where: {
        isActive: true,
        startDate: { lte: nowDate },
        endDate: { gte: nowDate },
      },
      include: {
        products: true,
        categories: true,
      },
    });

    const productIdMap = new Map<string, { id: string; name: string; discount: number }>();
    const categoryIdMap = new Map<string, { id: string; name: string; discount: number }[]>();

    for (const d of activeDiscounts) {
      for (const p of d.products) {
        productIdMap.set(p.productId, { id: d.id, name: d.name, discount: d.discount });
      }
      for (const c of d.categories) {
        const arr = categoryIdMap.get(c.categoryId) || [];
        arr.push({ id: d.id, name: d.name, discount: d.discount });
        categoryIdMap.set(c.categoryId, arr);
      }
    }

    cachedDiscounts = {
      data: activeDiscounts,
      productIdMap,
      categoryIdMap,
      timestamp: now,
    };

    return cachedDiscounts;
  } catch (error) {
    console.warn('⚠️ Failed to load seasonal discounts:', error);
    // Return empty cache on error
    return {
      data: [],
      productIdMap: new Map(),
      categoryIdMap: new Map(),
      timestamp: Date.now(),
    };
  }
}

export async function GET(request: NextRequest) {
  // Кеширование настроено через export const revalidate выше
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
    
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
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

    if (purposes.length > 0) {
      where.purpose = {
        in: purposes,
        mode: 'insensitive',
      };
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

    // Параллельно получаем count и продукты для лучшей производительности
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          shortDescription: true,
          price: true,
          comparePrice: true,
          sku: true,
          isActive: true,
          isFeatured: true,
          stock: true,
          createdAt: true,
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          productCategories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          images: {
            select: {
              url: true,
              alt: true,
              isPrimary: true,
            },
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' },
            ],
            take: 3, // Ограничиваем количество изображений для списка
          },
          variants: {
            select: {
              id: true,
              name: true,
              value: true,
              price: true,
              comparePrice: true,
              stock: true,
              sku: true,
              isDefault: true,
            },
            orderBy: [
              { isDefault: 'desc' },
              { sortOrder: 'asc' },
            ],
            take: 3, // Ограничиваем количество вариантов для списка
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Получаем кешированные скидки
    const discountCache = await getCachedDiscounts();
    const productIdToDiscount = discountCache.productIdMap;
    const categoryIdToDiscounts = discountCache.categoryIdMap;

    // Calculate average ratings and apply seasonal discounts to price
    // Wrap in try-catch for production safety
    let productsWithRatings: any[];
    try {
      productsWithRatings = products.map(product => {
        try {
          // Пока нет отзывов, устанавливаем рейтинг 0
          const averageRating = 0;
          const reviewCount = 0;
          // Determine seasonal discount (product-specific has priority, otherwise by category, take max)
          let seasonal: { id: string; name: string; discount: number } | null =
            productIdToDiscount.get(product.id) || null;
          if (!seasonal) {
            let maxCat: { id: string; name: string; discount: number } | null = null;
            for (const pc of product.productCategories || []) {
              // Исправлено: при использовании select структура меняется
              const categoryId = pc.category?.id;
              if (categoryId) {
                const arr = categoryIdToDiscounts.get(categoryId);
                if (arr && arr.length > 0) {
                  for (const s of arr) {
                    if (!maxCat || s.discount > maxCat.discount) maxCat = s;
                  }
                }
              }
            }
            seasonal = maxCat;
          }
          // Apply discount to numeric price for display
          const basePrice = Number(product.price) || 0;
          const discountedPrice = seasonal ? Math.max(0, Math.round(basePrice * (100 - seasonal.discount) / 100)) : basePrice;

          return {
            ...product,
            averageRating: averageRating,
            reviewCount: reviewCount,
            price: discountedPrice,
            comparePrice: seasonal ? basePrice : (product.comparePrice ? Number(product.comparePrice) : null),
            seasonalDiscount: seasonal || null,
            images: (product.images || []).map((img: any) => ({
              url: img.url || '',
              alt: img.alt || '',
              isPrimary: img.isPrimary || false,
            })),
            variants: (product.variants || []).map((v: any) => ({
              id: v.id,
              name: v.name || '',
              value: v.value || '',
              price: Number(v.price) || 0,
              comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
              stock: v.stock || 0,
              sku: v.sku || '',
              isDefault: v.isDefault || false,
            })),
          };
        } catch (productError) {
          // In production, return a simplified version of the product
          // In development, throw to catch issues
          if (isProduction) {
            console.warn(`⚠️ Error processing product ${product.id}, using fallback:`, productError);
            return {
              ...product,
              averageRating: 0,
              reviewCount: 0,
              price: Number(product.price) || 0,
              comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
              seasonalDiscount: null,
              images: [],
              variants: [],
            };
          } else {
            throw productError;
          }
        }
      });
    } catch (processingError) {
      // Final fallback: return products without discounts
      if (isProduction) {
        console.warn('⚠️ Error processing products, using fallback without discounts:', processingError);
        productsWithRatings = products.map(product => ({
          ...product,
          averageRating: 0,
          reviewCount: 0,
          price: Number(product.price) || 0,
          comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
          seasonalDiscount: null,
          images: (product.images || []).map((img: any) => ({
            url: img.url || '',
            alt: img.alt || '',
            isPrimary: img.isPrimary || false,
          })),
          variants: (product.variants || []).map((v: any) => ({
            id: v.id,
            name: v.name || '',
            value: v.value || '',
            price: Number(v.price) || 0,
            comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
            stock: v.stock || 0,
            sku: v.sku || '',
            isDefault: v.isDefault || false,
          })),
        }));
      } else {
        throw processingError;
      }
    }

    const response = NextResponse.json({
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    // Заголовки кеширования для Vercel Edge
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=60');

    return response;
  } catch (error) {
    console.error('Products API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // In production, provide more helpful error info
    // In development, show full error details
    if (process.env.NODE_ENV === 'production') {
      console.error('Full error details:', { message: errorMessage, stack: errorStack });
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        // Only include details in development
        ...(process.env.NODE_ENV !== 'production' && { details: errorMessage })
      },
      { status: 500 }
    );
  }
}
