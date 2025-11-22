import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Запуск базового API продуктов...');
    
    // Простейший запрос
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
      },
      take: 10,
    });
    
    console.log(`✅ Найдено продуктов: ${products.length}`);
    
    // Простая обработка без сложных вычислений
    const simpleProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      brand: product.brand ? {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
      } : null,
      categories: product.productCategories.map(pc => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      stock: product.stock,
    }));
    
    console.log(`✅ Обработано продуктов: ${simpleProducts.length}`);
    
    const response = {
      products: simpleProducts,
      total: products.length,
      message: 'Базовый API работает!'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Ошибка базового API:', error);
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


