import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDealerContextFromRequest } from '@/lib/dealer-context';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const dealerContext = await getDealerContextFromRequest(request);

    const dealerProductWhere = dealerContext
      ? {
          isActive: true,
          brandId: { in: dealerContext.allowedBrandIds },
          ...(dealerContext.allowedCategoryIds.length > 0
            ? { productCategories: { some: { categoryId: { in: dealerContext.allowedCategoryIds } } } }
            : {}),
        }
      : { isActive: true };

    // Если передан slug, возвращаем одну категорию
    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              productCategories: {
                where: {
                  product: dealerProductWhere as any,
                },
              },
            },
          },
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      if (dealerContext) {
        const isAllowedByCategory = dealerContext.allowedCategoryIds.length === 0 || dealerContext.allowedCategoryIds.includes(category.id);
        if (!isAllowedByCategory || category._count.productCategories === 0) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }
      }
      
      // Возвращаем с заголовками для предотвращения кэширования
      return NextResponse.json([category], {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Иначе возвращаем все категории
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        ...(dealerContext && dealerContext.allowedCategoryIds.length > 0
          ? { id: { in: dealerContext.allowedCategoryIds } }
          : {}),
      },
      include: {
        children: {
          where: {
            isActive: true,
            ...(dealerContext && dealerContext.allowedCategoryIds.length > 0
              ? { id: { in: dealerContext.allowedCategoryIds } }
              : {}),
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: {
              where: {
                product: dealerProductWhere as any,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Add product count to each category
    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category._count.productCategories,
      _count: undefined,
    })).filter((category) => category.productCount > 0);

    // Возвращаем с заголовками для предотвращения кэширования
    return NextResponse.json(categoriesWithCount, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

