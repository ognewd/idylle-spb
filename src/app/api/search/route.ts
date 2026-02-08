import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/image-url';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search in products by name, description, brand, and manufacturerSku
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            manufacturerSku: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            brand: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            productCategories: {
              some: {
                category: {
                  name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        brand: {
          select: {
            name: true,
          },
        },
        productCategories: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
        images: {
          take: 1,
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    // Базовый URL из запроса (учитываем прокси: x-forwarded-proto/host), чтобы картинки в поиске вели на текущий домен
    let requestOrigin = 'https://aromarussia.ru'; // fallback
    try {
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'aromarussia.ru';
      requestOrigin = `${proto}://${host}`;
    } catch (error) {
      console.error('Error getting request origin:', error);
    }

    const results = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      brand: product.brand?.name,
      category: product.productCategories[0]?.category?.name,
      image: getImageUrl(product.images[0]?.url, { baseUrl: requestOrigin }),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
