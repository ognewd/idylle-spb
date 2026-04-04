import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/transliterate';
import { getJwtSecret } from '@/lib/admin-auth';

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

// Функция для нормализации единиц измерения
function normalizeVolume(volumeStr: string | undefined | null): string | null {
  if (!volumeStr) return null;
  
  const str = String(volumeStr).trim().toLowerCase();
  
  // Обработка вариантов типа "100/125/250 мл"
  if (str.includes('/')) {
    const parts = str.split('/').map(p => p.trim());
    const units = parts.map(p => {
      // Извлекаем число и единицу измерения
      const match = p.match(/^(\d+)\s*(мл|гр|грр|г|л)?/i);
      if (match) {
        const num = match[1];
        const unit = match[2] || 'мл';
        // Нормализуем единицы
        if (unit.match(/^(гр|грр|г)$/i)) {
          return `${num} гр`;
        }
        return `${num} ${unit}`;
      }
      return p;
    });
    return units.join(' / ');
  }
  
  // Нормализация "грр" и "гр" в "гр"
  const normalized = str.replace(/грр/gi, 'гр').replace(/гр/gi, 'гр');
  
  // Извлекаем число и единицу
  const match = normalized.match(/^(\d+(?:[.,]\d+)?)\s*(мл|гр|г|л)?/i);
  if (match) {
    const num = match[1].replace(',', '.');
    let unit = match[2] || 'мл';
    if (unit.match(/^(гр|грр|г)$/i)) {
      unit = 'гр';
    }
    return `${num} ${unit}`;
  }
  
  return normalized;
}

function parseBool(val: string | undefined | null): boolean | null {
  if (val === undefined || val === null) return null;
  const s = String(val).trim().toLowerCase();
  if (!s) return null;
  if (['да', 'yes', '1', 'true', 'активен', 'рекомендуемый', 'y', 'д'].includes(s)) return true;
  if (['нет', 'no', '0', 'false', 'н', 'n'].includes(s)) return false;
  return null;
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
      include: {
        partner: {
          include: {
            brands: { include: { brand: true } },
          },
        },
      },
    });

    const allowedRoles = ['admin', 'super_admin', 'partner'];
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'partner' && !user.partner?.brands?.length) {
      return NextResponse.json(
        {
          error:
            'У вашего аккаунта не назначены бренды. Импорт недоступен. Обратитесь к администратору.',
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const columnMappingJson = formData.get('columnMapping') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не загружен' }, { status: 400 });
    }

    // Проверка типа файла
    if (!file.name.match(/\.(xls|xlsx)$/i)) {
      return NextResponse.json({ error: 'Поддерживаются только файлы Excel (.xls, .xlsx)' }, { status: 400 });
    }

    // Читаем файл
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Берем первый лист
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Конвертируем в JSON
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    
    if (rows.length < 2) {
      return NextResponse.json({ error: 'Файл пустой или не содержит данных' }, { status: 400 });
    }

    // Определяем заголовки (первая строка) - сохраняем оригинальное название
    const headers = rows[0].map((h: any) => String(h || '').trim());
    // Нормализация для маппинга: нижний регистр, единый вид запятой/пробела (Excel может дать unicode)
    const normalizeHeader = (s: string) =>
      s.toLowerCase()
        .replace(/ё/g, 'е') // Excel часто даёт «Объём» — иначе не совпадает с «объем»
        .replace(/\s+/g, ' ') // Заменяем все пробелы (включая неразрывные) на обычные
        .replace(/[\u00a0\u2007\u202f\u2009\u200a]/g, ' ') // Неразрывные пробелы
        .replace(/[,，\u060c\u3001]/g, ',')
        .replace(/[\u200b\u200c\u200d\ufeff]/g, '') // Удаляем невидимые символы
        .trim();
    const headersLower = headers.map((h: string) => normalizeHeader(h));
    
    // Если передан маппинг от пользователя, используем его, иначе автоопределяем по стандартным колонкам
    let columnMap: Record<string, number> = {};
    
    if (columnMappingJson) {
      try {
        const userMapping = JSON.parse(columnMappingJson);
        // Конвертируем маппинг из {field: columnIndex} в {field: number}
        Object.entries(userMapping).forEach(([field, colIndex]: [string, any]) => {
          if (colIndex !== null && colIndex !== undefined && colIndex !== '') {
            const index = typeof colIndex === 'string' ? parseInt(colIndex) : colIndex;
            if (!isNaN(index) && index >= 0 && index < headers.length) {
              columnMap[field] = index;
            }
          }
        });
      } catch (e) {
        return NextResponse.json({ error: 'Неверный формат маппинга колонок' }, { status: 400 });
      }
    } else {
      // Стандартный шаблон: колонки как в таблице пользователя (автоопределение)
      console.log('[Import Parse] All column headers:', headers.map((h, i) => `${i}: "${h}"`).join(', '));
      console.log('[Import Parse] Normalized headers:', headersLower.map((h, i) => `${i}: "${h}"`).join(', '));
      
      // Сначала собираем все колонки с изображениями, чтобы правильно их классифицировать
      const imageColumns: Array<{ index: number; header: string; normalized: string }> = [];
      headersLower.forEach((header: string, index: number) => {
        const normalized = header.toLowerCase();
        if (normalized.includes('изображен') || normalized.includes('фото') || normalized.includes('image') || normalized.includes('photo') || normalized.includes('картинка')) {
          imageColumns.push({ index, header: headers[index], normalized });
          console.log(`[Import Parse] Found image-related column ${index}: "${headers[index]}" -> normalized: "${normalized}"`);
        }
      });
      
      // Классифицируем колонки с изображениями: сначала ищем дополнительные, потом основные
      imageColumns.forEach(({ index, header, normalized }) => {
        // Проверяем, является ли это колонкой дополнительных изображений
        if (
          normalized === 'дополнительное изображение' ||
          normalized.includes('дополнительное изображение') ||
          normalized.includes('дополнительные изображения') ||
          normalized.includes('доп. изображение') ||
          normalized.includes('доп. изображения') ||
          normalized.includes('дополнительное фото') ||
          normalized.includes('дополнительные фото') ||
          (normalized.includes('доп') && (normalized.includes('изображен') || normalized.includes('фото'))) ||
          normalized.includes('extra images') ||
          normalized.includes('extra image') ||
          normalized.includes('additional images') ||
          normalized.includes('additional image') ||
          normalized.includes('дополнит') ||
          (normalized.includes('url') && normalized.includes('доп')) ||
          normalized.match(/доп.*изображен/i) ||
          normalized.match(/доп.*фото/i) ||
          normalized.match(/additional.*image/i) ||
          normalized.match(/extra.*image/i)
        ) {
          columnMap.additionalPhotos = index;
          console.log(`[Import Parse] ✅ Classified as additionalPhotos column at index ${index}: "${header}" (normalized: "${normalized}")`);
        } else if (
          // Основное изображение - только если это НЕ дополнительное
          !normalized.includes('доп') &&
          !normalized.includes('дополнит') &&
          !normalized.match(/доп.*изображен/i) &&
          !normalized.match(/доп.*фото/i)
        ) {
          // Если основное изображение еще не найдено, устанавливаем его
          if (columnMap.photo === undefined) {
            columnMap.photo = index;
            console.log(`[Import Parse] ✅ Classified as photo column at index ${index}: "${header}" (normalized: "${normalized}")`);
          }
        }
      });
      
      // Теперь обрабатываем остальные колонки
      headersLower.forEach((header: string, index: number) => {
        const normalized = header.toLowerCase();
        // Пропускаем колонки с изображениями - они уже обработаны
        if (normalized.includes('изображен') || normalized.includes('фото') || normalized.includes('image') || normalized.includes('photo') || normalized.includes('картинка')) {
          return; // Пропускаем, уже обработали выше
        }
        if (normalized.includes('код мой склад')) {
          columnMap.myWarehouseCode = index;
        } else if (normalized.includes('артикул производителя')) {
          columnMap.manufacturerSku = index;
        } else if (
          normalized.includes('полное название') ||
          (normalized.includes('наименование') && !normalized.includes('краткое')) ||
          normalized === 'название' ||
          (normalized.includes('название') && !normalized.includes('кратк'))
        ) {
          columnMap.name = index;
        } else if (normalized.includes('краткое название')) {
          columnMap.shortName = index;
        } else if (normalized.includes('тип категории') || normalized.includes('для фильтра')) {
          columnMap.productType = index;
        } else if (normalized.includes('категория') && !normalized.includes('тип')) {
          columnMap.category = index;
        } else if (normalized.includes('мест товара') || normalized.includes('место товара') || normalized.includes('место на складе')) {
          columnMap.warehouseLocation = index;
        } else if (normalized.includes('доступно') || normalized.includes('остаток')) {
          columnMap.stock = index;
        } else if (
          normalized.includes('цена до скидки') ||
          normalized.includes('старая цена') ||
          normalized.includes('compare')
        ) {
          columnMap.comparePrice = index;
        } else if (normalized.includes('цена продажи')) {
          columnMap.price = index;
        } else if (normalized === 'цена' || /^цена\s*[.,]\s*руб/.test(normalized) || normalized === 'цена руб') {
          columnMap.price = index;
        } else if (normalized.includes('описание аромата')) {
          columnMap.aromaDescription = index;
        } else if (normalized.includes('основные ноты')) {
          columnMap.topNotes = index;
        // Вес (г) / Вес, гр / Вес, кг — только в поле weight
        } else if (normalized.includes('вес') && !normalized.includes('объем') && (normalized.includes('гр') || normalized.includes('грамм') || normalized.includes('г,') || normalized.includes('(г)') || normalized.includes('кг'))) {
          columnMap.weight = index;
        // Объем, мл — только в поле volume
        } else if (normalized.includes('объем') || normalized.includes('обьем') || (normalized.includes('мл') && !normalized.includes('вес'))) {
          if (columnMap.volume === undefined) columnMap.volume = index;
        } else if (normalized.includes('назначение')) {
          columnMap.purpose = index;
        } else if (normalized.includes('способ применения')) {
          columnMap.usageInstructions = index;
        } else if (normalized === 'бренд' || (normalized.includes('бренд') && !normalized.includes('страна'))) {
          columnMap.brand = index;
        } else if (normalized.includes('страна происхождения бренда') || (normalized.includes('страна') && normalized.includes('бренд'))) {
          columnMap.brandCountry = index;
        } else if (normalized.includes('страна производства')) {
          columnMap.manufactureCountry = index;
        } else if (normalized.includes('страна') && !normalized.includes('бренд') && !normalized.includes('производства')) {
          columnMap.country = index;
        } else if (normalized.includes('штрихкод') || normalized.includes('штрих код')) {
          columnMap.barcode = index;
        } else if (normalized.includes('описание') && !normalized.includes('аромат') && !normalized.includes('кратк')) {
          columnMap.description = index;
        } else if (normalized.includes('краткое описание')) {
          columnMap.shortDescription = index;
        } else if ((normalized.includes('артикул') && !normalized.includes('производителя')) || normalized === 'sku') {
          columnMap.sku = index;
        } else if (normalized.includes('вес') && !normalized.includes('объем') && (normalized.includes('гр') || normalized.includes('г ') || normalized.includes('грамм') || normalized.includes('(г)') || normalized.includes('кг'))) {
          columnMap.weight = index;
        } else if (normalized.includes('габарит') || normalized.includes('размер') || normalized.includes('размеры') || normalized.includes('dimensions') || normalized.includes('см')) {
          columnMap.dimensions = index;
        } else if (normalized.includes('семейство аромата') || (normalized.includes('аромат') && normalized.includes('семейство'))) {
          columnMap.aromaFamily = index;
        } else if (normalized.includes('пол') && !normalized.includes('применения')) {
          columnMap.gender = index;
        } else if (normalized.includes('состав') || normalized.includes('ингредиент') || normalized.includes('ingredients')) {
          columnMap.ingredients = index;
        } else if (normalized.includes('активен') || normalized.includes('активный')) {
          columnMap.isActive = index;
        } else if (normalized.includes('рекомендуемый') || normalized.includes('хит') || normalized.includes('featured')) {
          columnMap.isFeatured = index;
        }
      });

      // Логируем найденные колонки для отладки
      console.log('[Import Parse] Column mapping:', {
        photo: columnMap.photo !== undefined ? headers[columnMap.photo] : 'not found',
        additionalPhotos: columnMap.additionalPhotos !== undefined ? headers[columnMap.additionalPhotos] : 'not found',
        photoIndex: columnMap.photo,
        additionalPhotosIndex: columnMap.additionalPhotos,
      });

      // Резерв: колонка "Вес, гр" / "Вес, кг" / "Вес (г)" по заголовку, если ещё не найдена
      if (columnMap.weight === undefined) {
        const weightIdx = headersLower.findIndex((h: string) => {
          const n = h; // уже normalizeHeader
          return n.includes('вес') && !n.includes('объем') && (n.includes('гр') || n.includes('(г)') || n.includes('грамм') || n.includes('кг'));
        });
        if (weightIdx >= 0) columnMap.weight = weightIdx;
      }
    }

    // Без маппинга: если найдена колонка наименования (в т.ч. «Название» из образца) — сразу парсим
    const isStandardTemplate = !columnMappingJson && columnMap.name !== undefined;
    if (!columnMappingJson && !isStandardTemplate) {
      const rowsPreview = rows.slice(1, Math.min(rows.length, 6));
      return NextResponse.json({
        columns: headers.map((h, i) => ({ index: i, name: h })),
        suggestedMapping: columnMap,
        totalRows: rows.length - 1,
        rowsPreview,
      });
    }

    // Проверяем обязательные поля
    if (columnMap.name === undefined) {
      return NextResponse.json({ error: 'Не указано соответствие для поля "Наименование"' }, { status: 400 });
    }

    // Обрабатываем данные
    const products: any[] = [];
    const errors: string[] = [];
    
    // Получаем все существующие бренды, категории и товары
    const [existingBrands, existingCategories, existingProducts] = await Promise.all([
      prisma.brand.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany({
        select: {
          id: true,
          myWarehouseCode: true,
          slug: true,
          sku: true,
          brandId: true,
        },
      }),
    ]);

    const brandMap = new Map(existingBrands.map(b => [b.name.toLowerCase(), b]));
    const categoryMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c]));
    const productMap = new Map(existingProducts.filter(p => p.myWarehouseCode).map(p => [p.myWarehouseCode!, p]));
    const productBySku = new Map<string, (typeof existingProducts)[number]>();
    for (const p of existingProducts) {
      const s = p.sku ? String(p.sku).trim() : '';
      if (s) productBySku.set(s, p);
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      try {
        const name = String(row[columnMap.name] || '').trim();
        if (!name) {
          errors.push(`Строка ${rowNum}: отсутствует наименование`);
          continue;
        }

        const myWarehouseCode = columnMap.myWarehouseCode !== undefined 
          ? String(row[columnMap.myWarehouseCode] || '').trim() || null 
          : null;

        const skuCell =
          columnMap.sku !== undefined ? String(row[columnMap.sku] || '').trim() || null : null;

        // Сначала МойСклад, иначе совпадение по артикулу (SKU) — иначе повторный импорт демо ломается на unique(sku)
        let existingProduct =
          myWarehouseCode && productMap.has(myWarehouseCode) ? productMap.get(myWarehouseCode)! : null;
        if (!existingProduct && skuCell) {
          existingProduct = productBySku.get(skuCell) ?? null;
        }

        // Бренд: для партнёра — только точное совпадение с разрешённым названием; для админа — как раньше
        const brandCellRaw =
          columnMap.brand !== undefined ? String(row[columnMap.brand] || '').trim() : '';
        const brandName = brandCellRaw || 'Без бренда';

        let brand: { id: string; name: string; slug?: string };

        if (user.role === 'partner' && user.partner) {
          if (!brandCellRaw) {
            errors.push(
              `Строка ${rowNum}: заполните колонку «Бренд» точным названием из списка в кабинете партнёра (регистр и пробелы должны совпадать).`
            );
            continue;
          }
          const allowedList = user.partner.brands.map((pb) => pb.brand.name);
          const foundBrand = user.partner.brands.find((pb) => pb.brand.name === brandCellRaw)?.brand;
          if (!foundBrand) {
            errors.push(
              `Строка ${rowNum}: бренд «${brandCellRaw}» недоступен для импорта или указан не так, как в каталоге. Допустимые названия (скопируйте в Excel без изменений): ${allowedList.map((n) => `«${n}»`).join(', ')}`
            );
            continue;
          }
          brand = foundBrand;
        } else {
          let b = brandMap.get(brandName.toLowerCase());
          if (!b) {
            const newBrand = { id: 'NEW', name: brandName, slug: generateSlug(brandName) } as any;
            b = newBrand;
            brandMap.set(brandName.toLowerCase(), newBrand);
          }
          brand = b;
        }

        if (user.role === 'partner' && user.partner && existingProduct) {
          const allowedBrandIds = new Set(user.partner.brands.map((pb) => pb.brand.id));
          if (!allowedBrandIds.has(existingProduct.brandId)) {
            errors.push(
              `Строка ${rowNum}: товар с таким артикулом (SKU) уже есть в каталоге под другим брендом. Измените SKU или обратитесь к администратору.`
            );
            continue;
          }
        }

        // Получаем категорию
        const categoryName = columnMap.category !== undefined 
          ? String(row[columnMap.category] || '').trim() 
          : null;
        
        let category = categoryName ? categoryMap.get(categoryName.toLowerCase()) : null;
        if (!category && categoryName) {
          const newCategory = { id: 'NEW', name: categoryName, slug: generateSlug(categoryName) } as any;
          category = newCategory;
          categoryMap.set(categoryName.toLowerCase(), newCategory);
        }

        // Цена, остаток, сравнение
        const priceStr = columnMap.price !== undefined ? String(row[columnMap.price] || '').trim() : '';
        const stockStr = columnMap.stock !== undefined ? String(row[columnMap.stock] || '').trim() : '';
        const comparePriceStr = columnMap.comparePrice !== undefined ? String(row[columnMap.comparePrice] || '').trim() : '';
        const rawWeight = columnMap.weight !== undefined ? row[columnMap.weight] : undefined;

        const price = priceStr ? parseFloat(priceStr.replace(/,/g, '.')) || 0 : 0;
        const stock = stockStr ? parseInt(stockStr, 10) || 0 : 0;
        const comparePrice = comparePriceStr ? parseFloat(comparePriceStr.replace(/,/g, '.')) || null : null;
        const weight = (() => {
          if (rawWeight === undefined || rawWeight === null || rawWeight === '') return null;
          if (typeof rawWeight === 'number' && !isNaN(rawWeight)) return rawWeight;
          const s = String(rawWeight).trim();
          const numMatch = s.replace(/,/g, '.').match(/[\d]+[.,]?[\d]*/);
          if (numMatch) {
            const parsed = parseFloat(numMatch[0].replace(/,/g, '.'));
            return !isNaN(parsed) ? parsed : null;
          }
          const parsed = parseFloat(s.replace(/,/g, '.'));
          return s && !isNaN(parsed) ? parsed : null;
        })();

        // Объем
        const volume = normalizeVolume(
          columnMap.volume !== undefined ? row[columnMap.volume] : undefined
        );

        const isActiveVal = columnMap.isActive !== undefined ? parseBool(row[columnMap.isActive]) : null;
        const isFeaturedVal = columnMap.isFeatured !== undefined ? parseBool(row[columnMap.isFeatured]) : null;

        // Сохраняем все колонки из файла
        const rawData: Record<number, any> = {};
        row.forEach((value: any, index: number) => {
          rawData[index] = value;
        });

        const str = (col: number | undefined) =>
          col !== undefined ? (String(row[col] ?? '').trim() || null) : null;

        // Описание аромата идёт в основное описание товара
        const aromaDesc = str(columnMap.aromaDescription);
        const mainDesc = str(columnMap.description);
        const product: any = {
          rowNum,
          name,
          shortName: str(columnMap.shortName),
          description: aromaDesc ?? mainDesc,
          shortDescription: str(columnMap.shortDescription),
          myWarehouseCode,
          manufacturerSku: str(columnMap.manufacturerSku),
          sku: skuCell,
          productType: str(columnMap.productType),
          categoryName: category?.name || categoryName || null,
          categoryId: category?.id || null,
          stock,
          price,
          comparePrice,
          volume,
          weight,
          dimensions: str(columnMap.dimensions),
          aromaDescription: aromaDesc,
          topNotes: str(columnMap.topNotes),
          aromaFamily: str(columnMap.aromaFamily),
          gender: str(columnMap.gender),
          purpose: str(columnMap.purpose),
          usageInstructions: str(columnMap.usageInstructions),
          ingredients: str(columnMap.ingredients),
          brandName: brand.name,
          brandId: brand.id,
          brandCountry: str(columnMap.brandCountry) ?? str(columnMap.country),
          manufactureCountry: str(columnMap.manufactureCountry),
          warehouseLocation: str(columnMap.warehouseLocation),
          barcode: str(columnMap.barcode),
          isActive: isActiveVal,
          isFeatured: isFeaturedVal,
          photoUrl: columnMap.photo !== undefined 
            ? (() => {
                const v = String(row[columnMap.photo!] || '').trim();
                if (!v) return null;
                if (v.startsWith('http://') || v.startsWith('https://')) return v;
                return null;
              })()
            : null,
          additionalImageUrls: columnMap.additionalPhotos !== undefined
            ? (() => {
                const raw = String(row[columnMap.additionalPhotos!] ?? '').trim();
                if (!raw) {
                  console.log(`[Import Parse] Row ${rowNum}: additionalPhotos column is empty`);
                  return [];
                }
                const urls = raw
                  .split(/[,;\n]+/)
                  .map((s: string) => s.trim())
                  .filter((s: string) => s && (s.startsWith('http://') || s.startsWith('https://')));
                console.log(`[Import Parse] Row ${rowNum}: Found ${urls.length} additional image URLs from column ${columnMap.additionalPhotos}:`, urls);
                return urls;
              })()
            : (() => {
                console.log(`[Import Parse] Row ${rowNum}: additionalPhotos column not found in columnMap. Available columns:`, headers.map((h, i) => `${i}: "${h}"`).join(', '));
                return [];
              })(),
          isUpdate: !!existingProduct,
          existingProductId: existingProduct?.id || null,
          rawData,
        };

        // Генерируем slug
        if (existingProduct) {
          product.slug = existingProduct.slug;
        } else {
          const baseSlug = generateSlug(name);
          let slug = baseSlug;
          let counter = 1;
          while (existingProducts.some(p => p.slug === slug)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
          product.slug = slug;
        }

        products.push(product);
      } catch (error: any) {
        errors.push(`Строка ${rowNum}: ${error.message}`);
      }
    }

    // Статистика
    const stats = {
      total: products.length,
      new: products.filter(p => !p.isUpdate).length,
      updates: products.filter(p => p.isUpdate).length,
      errors: errors.length,
    };

    // Собираем информацию о распознавании колонок для отображения пользователю
    const columnMappingInfo = {
      photo: columnMap.photo !== undefined 
        ? { index: columnMap.photo, name: headers[columnMap.photo], found: true }
        : { found: false, message: 'Колонка с основным изображением не найдена' },
      additionalPhotos: columnMap.additionalPhotos !== undefined
        ? { index: columnMap.additionalPhotos, name: headers[columnMap.additionalPhotos], found: true }
        : { found: false, message: 'Колонка "Дополнительное изображение" не найдена. Проверьте название колонки в файле.' },
    };

    return NextResponse.json({
      products,
      errors,
      stats,
      columns: headers.map((h, i) => ({ index: i, name: h })),
      columnMap, // Для отладки
      columnMappingInfo, // Информация о распознавании колонок для пользователя
    });
  } catch (error: any) {
    console.error('Import parse error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при обработке файла' },
      { status: 500 }
    );
  }
}

