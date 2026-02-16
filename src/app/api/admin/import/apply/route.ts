import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { join } from 'path';
import { existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/transliterate';
import { getJwtSecret } from '@/lib/admin-auth';

// Импорт товаров может занимать несколько минут (много товаров + загрузка изображений).
// Увеличиваем лимит времени выполнения; nginx на сервере тоже должен иметь большой proxy_read_timeout.
export const maxDuration = 300;

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

  // Логируем путь для отладки
  console.log(`[Import] Saving image to: ${uploadsDir} (UPLOADS_DIR=${process.env.UPLOADS_DIR || 'not set'})`);

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
    console.log(`[Import] Created directory: ${uploadsDir}`);
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

  // Проверяем, что файл действительно создан
  if (!existsSync(filePath)) {
    throw new Error(`Файл не был создан: ${filePath}`);
  }
  console.log(`[Import] Image saved: ${filePath} -> /uploads/products/${filename}`);

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
    const { products, importMode = 'update' } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Массив товаров пуст' }, { status: 400 });
    }

    // Валидация режима импорта
    if (importMode !== 'update' && importMode !== 'replace') {
      return NextResponse.json({ error: 'Неверный режим импорта' }, { status: 400 });
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
        
        // Логируем данные для отладки
        console.log(`[Import Apply] Product "${name}": Received data:`, {
          photoUrl,
          additionalImageUrls,
          additionalImageUrlsType: typeof additionalImageUrls,
          additionalImageUrlsIsArray: Array.isArray(additionalImageUrls),
          additionalImageUrlsLength: Array.isArray(additionalImageUrls) ? additionalImageUrls.length : 'N/A',
        });

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
            'аромат для дома': 'aromaty-dlya-doma', // Вариант без "ы"
            'аромат для дома': 'aromaty-dlya-doma', // Дополнительные варианты
            'подарок': 'podarki',
            'подарки': 'podarki',
          };
          
          // Нормализация названия категории: убираем множественное/единственное число для "аромат(ы) для дома"
          let normalizedCategoryName = categoryName.toLowerCase().trim();
          // Нормализуем "аромат для дома" -> "ароматы для дома"
          if (normalizedCategoryName === 'аромат для дома' || normalizedCategoryName.startsWith('аромат для дома')) {
            normalizedCategoryName = 'ароматы для дома';
          }
          
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
          let updateData: any = {};
          
          if (importMode === 'replace') {
            // Режим "Удалить и загрузить заново" - полная перезапись
            updateData = {
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
          } else {
            // Режим "Обновить" - дополняем только те поля, которые есть в файле
            if (name) updateData.name = name;
            if (shortName !== null && shortName !== undefined) updateData.shortName = shortName || undefined;
            if (description !== null && description !== undefined) updateData.description = description ?? undefined;
            if (shortDescription !== null && shortDescription !== undefined) updateData.shortDescription = shortDescription ?? undefined;
            if (price !== null && price !== undefined) updateData.price = price ?? 0;
            if (comparePrice !== null && comparePrice !== undefined) updateData.comparePrice = comparePrice ?? undefined;
            if (stock !== null && stock !== undefined) updateData.stock = stock ?? 0;
            if (brand?.id) updateData.brandId = brand.id;
            if (sku !== null && sku !== undefined) updateData.sku = sku ?? undefined;
            if (myWarehouseCode !== null && myWarehouseCode !== undefined) updateData.myWarehouseCode = myWarehouseCode || undefined;
            if (manufacturerSku !== null && manufacturerSku !== undefined) updateData.manufacturerSku = manufacturerSku || undefined;
            if (productType !== null && productType !== undefined) updateData.productType = productType || undefined;
            if (volume !== null && volume !== undefined) updateData.volume = volume || undefined;
            if (weight !== null && weight !== undefined && weight !== '') updateData.weight = new Prisma.Decimal(Number(weight));
            if (dimensions !== null && dimensions !== undefined) updateData.dimensions = dimensions || undefined;
            if (aromaDescription !== null && aromaDescription !== undefined) updateData.aromaDescription = aromaDescription || undefined;
            if (topNotes !== null && topNotes !== undefined) updateData.topNotes = topNotes || undefined;
            if (aromaFamily !== null && aromaFamily !== undefined) updateData.aromaFamily = aromaFamily || undefined;
            if (gender !== null && gender !== undefined) updateData.gender = gender || undefined;
            if (purpose !== null && purpose !== undefined) updateData.purpose = purpose || undefined;
            if (usageInstructions !== null && usageInstructions !== undefined) updateData.usageInstructions = usageInstructions || undefined;
            if (ingredients !== null && ingredients !== undefined) updateData.ingredients = ingredients || undefined;
            if (brandCountry !== null && brandCountry !== undefined) updateData.brandCountry = brandCountry || undefined;
            if (manufactureCountry !== null && manufactureCountry !== undefined) updateData.manufactureCountry = manufactureCountry || undefined;
            if (warehouseLocation !== null && warehouseLocation !== undefined) updateData.warehouseLocation = warehouseLocation || undefined;
            if (barcode !== null && barcode !== undefined) updateData.barcode = barcode || undefined;
            if (isActive !== null && isActive !== undefined) updateData.isActive = isActive;
            if (isFeatured !== null && isFeatured !== undefined) updateData.isFeatured = isFeatured;
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.product.update({
              where: { id: existingProductId },
              data: updateData,
            });
          }

          // Обновляем категории
          if (categoryIdFinal) {
            if (importMode === 'replace') {
              // Удаляем старые связи с категориями
              await prisma.productCategory.deleteMany({
                where: { productId: existingProductId },
              });
            }
            // Проверяем, нет ли уже такой связи
            const existingCategory = await prisma.productCategory.findFirst({
              where: {
                productId: existingProductId,
                categoryId: categoryIdFinal,
              },
            });
            if (!existingCategory) {
              // Создаем новую связь
              await prisma.productCategory.create({
                data: {
                  productId: existingProductId,
                  categoryId: categoryIdFinal,
                  isPrimary: true,
                },
              });
            }
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

        // Обработка изображений
        const hasPhotoFromImport =
          (photoUrl && typeof photoUrl === 'string' && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) ||
          (Array.isArray(additionalImageUrls) && additionalImageUrls.some((u: string) => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))));
        
        // В режиме "replace" удаляем старые изображения перед добавлением новых
        if (importMode === 'replace' && isUpdate && existingProductId && hasPhotoFromImport) {
          await prisma.productImage.deleteMany({
            where: { productId: existingProductId },
          });
        }

        // Определяем начальный sortOrder для новых изображений
        let nextSortOrder = 0;
        let isFirstImage = true; // Флаг для определения главного изображения
        
        if (importMode === 'update' && isUpdate && existingProductId) {
          // В режиме "update" находим максимальный sortOrder существующих изображений
          const maxSortOrder = await prisma.productImage.findFirst({
            where: { productId: existingProductId },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true },
          });
          nextSortOrder = maxSortOrder ? maxSortOrder.sortOrder + 1 : 0;
          isFirstImage = false; // В режиме update не делаем главным
        } else if (importMode === 'replace' && isUpdate && existingProductId) {
          // В режиме replace после удаления изображений - следующее будет первым
          isFirstImage = true;
          nextSortOrder = 0;
        }

        // Фото по URL: скачиваем и сохраняем
        if (photoUrl && typeof photoUrl === 'string' && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
          try {
            const savedUrl = await downloadImageAsUpload(photoUrl);
            if (savedUrl) {
              // Проверяем, нет ли уже такого изображения (в режиме update)
              if (importMode === 'update' && isUpdate && existingProductId) {
                const existingImage = await prisma.productImage.findFirst({
                  where: {
                    productId: existingProductId,
                    url: savedUrl,
                  },
                });
                if (existingImage) {
                  // Изображение уже существует, пропускаем
                  nextSortOrder = Math.max(nextSortOrder, existingImage.sortOrder + 1);
                } else {
                  // Добавляем как дополнительное изображение (не перезаписываем главное)
                  await prisma.productImage.create({
                    data: {
                      productId: productIdForPhoto,
                      url: savedUrl,
                      alt: name,
                      sortOrder: nextSortOrder,
                      isPrimary: false, // В режиме update не перезаписываем главное
                    },
                  });
                  nextSortOrder++;
                }
              } else {
                // В режиме replace или для нового товара - создаем как главное (если это первое изображение)
                await prisma.productImage.create({
                  data: {
                    productId: productIdForPhoto,
                    url: savedUrl,
                    alt: name,
                    sortOrder: 0,
                    isPrimary: isFirstImage, // Главное только если это первое изображение
                  },
                });
                nextSortOrder = 1;
                isFirstImage = false; // Следующие изображения уже не будут главными
              }
            }
          } catch (imgErr: any) {
            results.photoErrors.push(`Товар "${name}": фото не загружено — ${imgErr?.message || String(imgErr)}`);
          }
        }

        // Доп. изображения: URL через запятую, скачиваем и создаём ProductImage (isPrimary: false)
        const urls = Array.isArray(additionalImageUrls) ? additionalImageUrls : [];
        console.log(`[Import Apply] Product "${name}": additionalImageUrls from productData:`, additionalImageUrls);
        console.log(`[Import Apply] Product "${name}": Processing ${urls.length} additional images, nextSortOrder=${nextSortOrder}`);
        
        if (urls.length === 0) {
          console.log(`[Import Apply] Product "${name}": No additional images to process (urls array is empty)`);
        }
        
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          console.log(`[Import Apply] Product "${name}": Processing additional image ${i + 1}/${urls.length}, URL:`, url, `Type:`, typeof url);
          
          if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
            console.log(`[Import Apply] Product "${name}": Skipping invalid additional image URL ${i + 1}:`, url, `(starts with http/https: ${typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))})`);
            continue;
          }
          
          console.log(`[Import Apply] Product "${name}": Downloading additional image ${i + 1}/${urls.length}:`, url);
          try {
            const savedUrl = await downloadImageAsUpload(url);
            if (savedUrl) {
              // Проверяем, нет ли уже такого изображения (в режиме update)
              if (importMode === 'update' && isUpdate && existingProductId) {
                const existingImage = await prisma.productImage.findFirst({
                  where: {
                    productId: existingProductId,
                    url: savedUrl,
                  },
                });
                if (existingImage) {
                  // Изображение уже существует, пропускаем
                  console.log(`[Import Apply] Product "${name}": Additional image ${i + 1} already exists, skipping`);
                  continue;
                }
              }
              
              // Используем правильный sortOrder: после основного изображения
              const additionalSortOrder = nextSortOrder + i;
              console.log(`[Import Apply] Product "${name}": Creating additional image ${i + 1} with sortOrder=${additionalSortOrder}`);
              
              await prisma.productImage.create({
                data: {
                  productId: productIdForPhoto,
                  url: savedUrl,
                  alt: `${name} — фото ${i + 1}`,
                  sortOrder: additionalSortOrder,
                  isPrimary: false,
                },
              });
              console.log(`[Import Apply] Product "${name}": Successfully created additional image ${i + 1} at ${savedUrl} with sortOrder=${additionalSortOrder}`);
            } else {
              console.log(`[Import Apply] Product "${name}": Failed to download additional image ${i + 1}, downloadImageAsUpload returned null`);
            }
          } catch (imgErr: any) {
            console.error(`[Import Apply] Product "${name}": Error processing additional image ${i + 1}:`, imgErr);
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

