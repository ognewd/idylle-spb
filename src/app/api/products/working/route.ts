import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Запуск рабочего API продуктов...');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    
    console.log(`📄 Страница: ${page}, Лимит: ${limit}`);
    
    // Простой запрос без сложных зависимостей
    const where = {
      isActive: true,
    };
    
    const total = await prisma.product.count({ where });
    console.log(`📊 Всего продуктов: ${total}`);
    
    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    console.log(`✅ Найдено продуктов: ${products.length}`);
    
    // Простая обработка без сезонных скидок
    const processedProducts = products.map(product => {
      const ratings: number[] = []; // Пока нет отзывов
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
      
      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        seasonalDiscount: null, // Пока нет скидок
      };
    });
    
    const response = {
      products: processedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 0 },
      },
    };
    
    console.log(`✅ Ответ готов: ${processedProducts.length} продуктов`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Ошибка рабочего API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


