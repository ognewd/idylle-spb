import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/transliterate';

function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    return decoded;
  } catch {
    return null;
  }
}

// Используем generateSlug из lib/transliterate

export async function POST(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: admin.userId },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Массив товаров пуст' }, { status: 400 });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Обрабатываем товары по одному
    for (const productData of products) {
      try {
        const {
          name,
          slug,
          myWarehouseCode,
          manufacturerSku,
          productType,
          categoryName,
          categoryId,
          stock,
          price,
          aromaDescription,
          topNotes,
          volume,
          purpose,
          brandName,
          brandId,
          country,
          barcode,
          isUpdate,
          existingProductId,
        } = productData;

        // Получаем или создаем бренд
        let brand;
        if (brandId === 'NEW') {
          // Сначала пытаемся найти бренд по slug
          const brandSlug = generateSlug(brandName);
          brand = await prisma.brand.findUnique({
            where: { slug: brandSlug },
          });
          
          // Если не найден, создаем новый
          if (!brand) {
            brand = await prisma.brand.create({
              data: {
                name: brandName,
                slug: brandSlug,
              },
            });
          }
        } else {
          brand = await prisma.brand.findUnique({
            where: { id: brandId },
          });
          if (!brand) {
            results.errors.push(`Товар "${name}": бренд не найден`);
            continue;
          }
        }

        // Получаем или создаем категорию
        let categoryIdFinal: string | null = null;
        if (categoryName && categoryId === 'NEW') {
          // Маппинг названий категорий из файла на реальные категории
          const categoryMapping: Record<string, string> = {
            'уют и интерьер': 'uyut-i-interer',
            'ароматы для дома': 'aromaty-dlya-doma',
            'подарок': 'podarki',
            'подарки': 'podarki',
          };
          
          const normalizedCategoryName = categoryName.toLowerCase().trim();
          const targetSlug = categoryMapping[normalizedCategoryName] || generateSlug(categoryName);
          
          // Сначала пытаемся найти категорию по slug
          let category = await prisma.category.findUnique({
            where: { slug: targetSlug },
          });
          
          // Если не найдена, создаем новую
          if (!category) {
            // Используем правильное название для известных категорий
            const categoryNames: Record<string, string> = {
              'uyut-i-interer': 'Уют и интерьер',
              'aromaty-dlya-doma': 'Ароматы для дома',
              'podarki': 'Подарки',
            };
            
            category = await prisma.category.create({
              data: {
                name: categoryNames[targetSlug] || categoryName,
                slug: targetSlug,
              },
            });
          }
          
          categoryIdFinal = category.id;
        } else if (categoryId && categoryId !== 'NEW') {
          const category = await prisma.category.findUnique({
            where: { id: categoryId },
          });
          if (category) {
            categoryIdFinal = category.id;
          }
        }

        if (isUpdate && existingProductId) {
          // Обновляем существующий товар
          const updateData: any = {
            name,
            price: price || 0,
            stock: stock || 0,
            brandId: brand.id,
            myWarehouseCode: myWarehouseCode || undefined,
            manufacturerSku: manufacturerSku || undefined,
            productType: productType || undefined,
            aromaDescription: aromaDescription || undefined,
            topNotes: topNotes || undefined,
            volume: volume || undefined,
            purpose: purpose || undefined,
            country: country || undefined,
            barcode: barcode || undefined,
          };

          await prisma.product.update({
            where: { id: existingProductId },
            data: updateData,
          });

          // Обновляем категории
          if (categoryIdFinal) {
            // Удаляем старые связи с категориями
            await prisma.productCategory.deleteMany({
              where: { productId: existingProductId },
            });
            // Создаем новую связь
            await prisma.productCategory.create({
              data: {
                productId: existingProductId,
                categoryId: categoryIdFinal,
                isPrimary: true,
              },
            });
          }

          results.updated++;
        } else {
          // Создаем новый товар
          const product = await prisma.product.create({
            data: {
              name,
              slug: slug || generateSlug(name),
              price: price || 0,
              stock: stock || 0,
              brandId: brand.id,
              myWarehouseCode: myWarehouseCode || undefined,
              manufacturerSku: manufacturerSku || undefined,
              productType: productType || undefined,
              aromaDescription: aromaDescription || undefined,
              topNotes: topNotes || undefined,
              volume: volume || undefined,
              purpose: purpose || undefined,
              country: country || undefined,
              barcode: barcode || undefined,
              isActive: true,
              productCategories: categoryIdFinal ? {
                create: {
                  categoryId: categoryIdFinal,
                  isPrimary: true,
                },
              } : undefined,
            },
          });

          results.created++;
        }
      } catch (error: any) {
        results.errors.push(`Товар "${productData.name}": ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Import apply error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при применении импорта' },
      { status: 500 }
    );
  }
}

