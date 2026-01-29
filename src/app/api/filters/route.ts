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
    const [productTypes, volumes, purposes, _, brands] = await Promise.all([
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
      
      // Назначение (purpose) — значения могут быть через запятую, нужны уникальные токены
      prisma.product.findMany({
        where: {
          ...baseWhere,
          purpose: { not: null },
        },
        select: {
          purpose: true,
        },
      }),
      
      // Страна - убрано, используем brandCountry и manufactureCountry вместо country
      Promise.resolve([]),
      
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

    // Назначение: разбить по запятой, оставить только уникальные значения (без дублей)
    const splitPurpose = (s: string | null): string[] =>
      !s ? [] : s.split(/\s*,\s*/).map(t => t.trim()).filter(Boolean);
    const purposeTokensMap = new Map<string, string>(); // normalized (lower) -> display (first occurrence)
    for (const row of purposes) {
      if (!row.purpose) continue;
      for (const token of splitPurpose(row.purpose)) {
        const key = token.toLowerCase();
        if (!purposeTokensMap.has(key)) purposeTokensMap.set(key, token);
      }
    }
    const uniquePurposeTokens = Array.from(purposeTokensMap.values()).sort((a, b) =>
      a.localeCompare(b, 'ru')
    );

    // Подсчёт товаров по каждому уникальному назначению (поле purpose содержит этот токен в списке через запятую)
    const purposeCounts: Record<string, number> = {};
    const purposeWhere = (token: string) => ({
      OR: [
        { purpose: { equals: token, mode: 'insensitive' as const } },
        { purpose: { startsWith: token + ',', mode: 'insensitive' as const } },
        { purpose: { startsWith: token + ', ', mode: 'insensitive' as const } },
        { purpose: { endsWith: ',' + token, mode: 'insensitive' as const } },
        { purpose: { endsWith: ', ' + token, mode: 'insensitive' as const } },
        { purpose: { contains: ',' + token + ',', mode: 'insensitive' as const } },
        { purpose: { contains: ', ' + token + ',', mode: 'insensitive' as const } },
        { purpose: { contains: ',' + token + ', ', mode: 'insensitive' as const } },
        { purpose: { contains: ', ' + token + ', ', mode: 'insensitive' as const } },
      ],
    });
    const purposeCountResults = await Promise.all(
      uniquePurposeTokens.map(async (token) => {
        const count = await prisma.product.count({
          where: { ...baseWhere, ...purposeWhere(token) },
        });
        return { token, count };
      })
    );
    purposeCountResults.forEach(({ token, count }) => { purposeCounts[token] = count; });

    const [productTypeCounts, volumeCounts] = await Promise.all([
      getFilterCounts('productType', productTypes.map(p => p.productType)),
      getFilterCounts('volume', volumes.map(v => v.volume)),
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
      purpose: uniquePurposeTokens
        .filter(token => purposeCounts[token] > 0)
        .map(token => ({
          id: token,
          name: token,
          count: purposeCounts[token],
        })),
      country: [], // Убрано, используется brandCountry и manufactureCountry
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

