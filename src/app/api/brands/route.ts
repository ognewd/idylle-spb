import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
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
      orderBy: { name: 'asc' },
    });

    // Add product count to each brand and filter out brands with no products
    const brandsWithCount = brands
      .map(brand => ({
        ...brand,
        productCount: brand._count.products,
        _count: undefined,
      }))
      .filter(brand => brand.productCount > 0); // Показываем только бренды с товарами

    return NextResponse.json(brandsWithCount);
  } catch (error) {
    console.error('Brands API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

