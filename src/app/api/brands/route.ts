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

    // Add product count to each brand
    const brandsWithCount = brands.map(brand => ({
      ...brand,
      productCount: brand._count.products,
      _count: undefined,
    }));

    return NextResponse.json(brandsWithCount);
  } catch (error) {
    console.error('Brands API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

