import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // Базовое условие для where
    const baseWhere: any = {
      isActive: true,
    };

    // Если указана категория, фильтруем по ней
    if (category) {
      baseWhere.productCategories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    // Получаем уникальные значения для фильтров
    const [productTypes, volumes, purposes, countries, brands] = await Promise.all([
      // Вид товара (productType)
      prisma.product.findMany({
        where: {
          ...baseWhere,
          productType: { not: null },
        },
        select: {
          productType: true,
        },
        distinct: ['productType'],
      }),
      
      // Объем (volume)
      prisma.product.findMany({
        where: {
          ...baseWhere,
          volume: { not: null },
        },
        select: {
          volume: true,
        },
        distinct: ['volume'],
      }),
      
      // Назначение (purpose)
      prisma.product.findMany({
        where: {
          ...baseWhere,
          purpose: { not: null },
        },
        select: {
          purpose: true,
        },
        distinct: ['purpose'],
      }),
      
      // Страна (country)
      prisma.product.findMany({
        where: {
          ...baseWhere,
          country: { not: null },
        },
        select: {
          country: true,
        },
        distinct: ['country'],
      }),
      
      // Бренды
      prisma.brand.findMany({
        where: {
          isActive: true,
          products: {
            some: category ? {
              isActive: true,
              productCategories: {
                some: {
                  category: {
                    slug: category,
                  },
                },
              },
            } : {
              isActive: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              products: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Получаем количество товаров для каждого значения фильтра
    const getFilterCounts = async (field: string, values: (string | null)[]) => {
      const counts: Record<string, number> = {};
      
      for (const value of values.filter(v => v !== null)) {
        const count = await prisma.product.count({
          where: {
            ...baseWhere,
            [field]: value as string,
          },
        });
        counts[value as string] = count;
      }
      
      return counts;
    };

    const [productTypeCounts, volumeCounts, purposeCounts, countryCounts] = await Promise.all([
      getFilterCounts('productType', productTypes.map(p => p.productType)),
      getFilterCounts('volume', volumes.map(v => v.volume)),
      getFilterCounts('purpose', purposes.map(p => p.purpose)),
      getFilterCounts('country', countries.map(c => c.country)),
    ]);

    return NextResponse.json({
      productType: productTypes
        .filter(p => p.productType)
        .map(p => ({
          id: p.productType!,
          name: p.productType!,
          count: productTypeCounts[p.productType!] || 0,
        })),
      volume: volumes
        .filter(v => v.volume)
        .map(v => ({
          id: v.volume!,
          name: v.volume!,
          count: volumeCounts[v.volume!] || 0,
        })),
      purpose: purposes
        .filter(p => p.purpose)
        .map(p => ({
          id: p.purpose!,
          name: p.purpose!,
          count: purposeCounts[p.purpose!] || 0,
        })),
      country: countries
        .filter(c => c.country)
        .map(c => ({
          id: c.country!,
          name: c.country!,
          count: countryCounts[c.country!] || 0,
        })),
      brand: brands.map(b => ({
        id: b.slug,
        name: b.name,
        count: b._count.products,
      })).filter(b => b.count > 0),
    });
  } catch (error) {
    console.error('Filters API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

