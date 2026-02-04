import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { join } from 'path';
import { existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/transliterate';
import { getJwtSecret } from '@/lib/admin-auth';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

async function downloadImageAsUpload(photoUrl: string): Promise<string | null> {
  const baseUploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads');
  const uploadsDir = join(baseUploadsDir, 'products');

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  let res: Response;
  try {
    res = await fetch(photoUrl, {
      headers: { 'User-Agent': 'Idylle-Import/1.0' },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e) {
    throw new Error(`Ошибка загрузки: ${e instanceof Error ? e.message : 'network'}`);
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const extFromMime = MIME_TO_EXT[contentType];
  let ext = extFromMime;

  if (!ext) {
    try {
      const u = new URL(photoUrl);
      const pathname = u.pathname || '';
      const last = pathname.split('/').pop() || '';
      const idx = last.lastIndexOf('.');
      if (idx > 0) {
        const candidate = last.slice(idx).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(candidate)) ext = candidate.slice(1);
      }
    } catch { /* ignore */ }
  }

  if (!ext) ext = 'jpg';

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new Error('Файл превышает 10 МБ');
  }
  if (buffer.length === 0) {
    throw new Error('Пустой ответ');
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const filename = `${timestamp}-${randomString}.${ext}`;
  const filePath = join(uploadsDir, filename);
  await writeFile(filePath, buffer);

  return `/uploads/products/${filename}`;
}

function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const secret = getJwtSecret();
  if (!secret) return null;
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, secret) as any;
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
      photoErrors: [] as string[],
    };

    // Обрабатываем товары по одному
    for (const productData of products) {
      try {
        const {
          name,
          shortName,
          slug,
          description,
          shortDescription,
          myWarehouseCode,
          manufacturerSku,
          sku,
          productType,
          categoryName,
          categoryId,
          stock,
          price,
          comparePrice,
          volume,
          weight,
          dimensions,
          aromaDescription,
          topNotes,
          aromaFamily,
          gender,
          purpose,
          usageInstructions,
          ingredients,
          brandName,
          brandId,
          brandCountry,
          manufactureCountry,
          warehouseLocation,
          barcode,
          isActive,
          isFeatured,
          photoUrl,
          additionalImageUrls = [],
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

        let productIdForPhoto: string;

        if (isUpdate && existingProductId) {
          // Обновляем существующий товар
          const updateData: any = {
            name,
            shortName: shortName || undefined,
            description: description ?? undefined,
            shortDescription: shortDescription ?? undefined,
            price: price ?? 0,
            comparePrice: comparePrice ?? undefined,
            stock: stock ?? 0,
            brandId: brand.id,
            sku: sku ?? undefined,
            myWarehouseCode: myWarehouseCode || undefined,
            manufacturerSku: manufacturerSku || undefined,
            productType: productType || undefined,
            volume: volume || undefined,
            weight: weight != null && weight !== '' ? new Prisma.Decimal(Number(weight)) : undefined,
            dimensions: dimensions || undefined,
            aromaDescription: aromaDescription || undefined,
            topNotes: topNotes || undefined,
            aromaFamily: aromaFamily || undefined,
            gender: gender || undefined,
            purpose: purpose || undefined,
            usageInstructions: usageInstructions || undefined,
            ingredients: ingredients || undefined,
            brandCountry: brandCountry || undefined,
            manufactureCountry: manufactureCountry || undefined,
            warehouseLocation: warehouseLocation || undefined,
            barcode: barcode || undefined,
            ...(isActive !== null && isActive !== undefined && { isActive }),
            ...(isFeatured !== null && isFeatured !== undefined && { isFeatured }),
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

          productIdForPhoto = existingProductId;
          results.updated++;
        } else {
          // Создаем новый товар
          const product = await prisma.product.create({
            data: {
              name,
              shortName: shortName || undefined,
              description: description ?? undefined,
              shortDescription: shortDescription ?? undefined,
              slug: slug || generateSlug(name),
              price: price ?? 0,
              comparePrice: comparePrice ?? undefined,
              stock: stock ?? 0,
              brandId: brand.id,
              sku: sku ?? undefined,
              myWarehouseCode: myWarehouseCode || undefined,
              manufacturerSku: manufacturerSku || undefined,
              productType: productType || undefined,
              volume: volume || undefined,
              weight: weight != null && weight !== '' ? new Prisma.Decimal(Number(weight)) : undefined,
              dimensions: dimensions || undefined,
              aromaDescription: aromaDescription || undefined,
              topNotes: topNotes || undefined,
              aromaFamily: aromaFamily || undefined,
              gender: gender || undefined,
              purpose: purpose || undefined,
              usageInstructions: usageInstructions || undefined,
              ingredients: ingredients || undefined,
              brandCountry: brandCountry || undefined,
              manufactureCountry: manufactureCountry || undefined,
              warehouseLocation: warehouseLocation || undefined,
              barcode: barcode || undefined,
              isActive: isActive ?? true,
              isFeatured: isFeatured ?? false,
              productCategories: categoryIdFinal ? {
                create: {
                  categoryId: categoryIdFinal,
                  isPrimary: true,
                },
              } : undefined,
            },
          });

          productIdForPhoto = product.id;
          results.created++;
        }

        // При импорте с фото — перезаписываем все фото товара (удаляем старые, чтобы не было дублей)
        const hasPhotoFromImport =
          (photoUrl && typeof photoUrl === 'string' && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) ||
          (Array.isArray(additionalImageUrls) && additionalImageUrls.some((u: string) => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))));
        if (isUpdate && existingProductId && hasPhotoFromImport) {
          await prisma.productImage.deleteMany({
            where: { productId: existingProductId },
          });
        }

        // Фото по URL: скачиваем и сохраняем как главное изображение
        let nextSortOrder = 0;
        if (photoUrl && typeof photoUrl === 'string' && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
          try {
            const savedUrl = await downloadImageAsUpload(photoUrl);
            if (savedUrl) {
              await prisma.productImage.create({
                data: {
                  productId: productIdForPhoto,
                  url: savedUrl,
                  alt: name,
                  sortOrder: 0,
                  isPrimary: true,
                },
              });
              nextSortOrder = 1;
            }
          } catch (imgErr: any) {
            results.photoErrors.push(`Товар "${name}": фото не загружено — ${imgErr?.message || String(imgErr)}`);
          }
        }

        // Доп. изображения: URL через запятую, скачиваем и создаём ProductImage (isPrimary: false)
        const urls = Array.isArray(additionalImageUrls) ? additionalImageUrls : [];
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) continue;
          try {
            const savedUrl = await downloadImageAsUpload(url);
            if (savedUrl) {
              await prisma.productImage.create({
                data: {
                  productId: productIdForPhoto,
                  url: savedUrl,
                  alt: `${name} — фото ${i + 1}`,
                  sortOrder: nextSortOrder + i,
                  isPrimary: false,
                },
              });
            }
          } catch (imgErr: any) {
            results.photoErrors.push(`Товар "${name}": доп. изображение ${i + 1} не загружено — ${imgErr?.message || String(imgErr)}`);
          }
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

