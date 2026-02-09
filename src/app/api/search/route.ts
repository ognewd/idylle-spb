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
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'aromarussia.ru';
      // Определяем протокол: для localhost используем http, иначе берем из заголовка или используем https
      const proto = host.includes('localhost') || host.includes('127.0.0.1')
        ? 'http'
        : (request.headers.get('x-forwarded-proto') || 'https');
      requestOrigin = `${proto}://${host}`;
    } catch (error) {
      console.error('Error getting request origin:', error);
    }

    const results = products.map((product) => {
      // Для поиска всегда формируем полный URL, так как это используется в клиентском компоненте
      // и Next.js Image может требовать полный URL для корректной загрузки
      let imageUrl = product.images[0]?.url;
      if (imageUrl) {
        // Если URL уже полный, используем как есть
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          imageUrl = imageUrl;
        } else {
          // Для относительных путей формируем полный URL
          const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
          imageUrl = `${requestOrigin.replace(/\/$/, '')}${cleanUrl}`;
        }
      } else {
        imageUrl = '/placeholder-product.jpg';
      }
      
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        brand: product.brand?.name,
        category: product.productCategories[0]?.category?.name,
        image: imageUrl,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
