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
    });

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        .replace(/\s+/g, ' ')
        .replace(/[\u00a0\u2007\u202f]/g, ' ')
        .replace(/[,，\u060c\u3001]/g, ',')
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
      headersLower.forEach((header: string, index: number) => {
        const normalized = header.toLowerCase();
        if (normalized.includes('код мой склад')) {
          columnMap.myWarehouseCode = index;
        } else if (normalized.includes('артикул производителя')) {
          columnMap.manufacturerSku = index;
        } else if (normalized.includes('полное название') || (normalized.includes('наименование') && !normalized.includes('краткое'))) {
          columnMap.name = index;
        } else if (normalized.includes('краткое название')) {
          columnMap.shortName = index;
        } else if (normalized.includes('тип категории') || normalized.includes('для фильтра')) {
          columnMap.productType = index;
        } else if (normalized.includes('категория') && !normalized.includes('тип')) {
          columnMap.category = index;
        } else if (normalized.includes('мест товара') || normalized.includes('место товара') || normalized.includes('место на складе')) {
          columnMap.warehouseLocation = index;
        } else if (normalized.includes('доступно')) {
          columnMap.stock = index;
        } else if (normalized.includes('цена продажи')) {
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
        } else if (normalized.includes('цена до скидки') || normalized.includes('старая цена') || normalized.includes('compare')) {
          columnMap.comparePrice = index;
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
        } else if (
          (normalized.includes('доп') && (normalized.includes('изображен') || normalized.includes('фото'))) ||
          normalized.includes('дополнительные изображения') ||
          normalized.includes('extra images') ||
          normalized.includes('additional images') ||
          (normalized.includes('url') && normalized.includes('доп'))
        ) {
          columnMap.additionalPhotos = index;
        } else if (
          normalized.includes('фото') ||
          normalized.includes('изображение') ||
          normalized.includes('картинка') ||
          normalized.includes('image') ||
          normalized.includes('photo') ||
          (normalized.includes('url') && (normalized.includes('фото') || normalized.includes('img')))
        ) {
          columnMap.photo = index;
        }
      });

      // Резерв: колонка "Вес, гр" / "Вес, кг" / "Вес (г)" по заголовку, если ещё не найдена
      if (columnMap.weight === undefined) {
        const weightIdx = headersLower.findIndex((h: string) => {
          const n = h.toLowerCase();
          return n.includes('вес') && !n.includes('объем') && (n.includes('гр') || n.includes('(г)') || n.includes('грамм') || n.includes('кг'));
        });
        if (weightIdx >= 0) columnMap.weight = weightIdx;
      }
    }

    // Без маппинга: если найдена колонка "Полное название" — сразу парсим (стандартный шаблон)
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
        },
      }),
    ]);

    const brandMap = new Map(existingBrands.map(b => [b.name.toLowerCase(), b]));
    const categoryMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c]));
    const productMap = new Map(existingProducts.filter(p => p.myWarehouseCode).map(p => [p.myWarehouseCode!, p]));

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

        const existingProduct = myWarehouseCode ? productMap.get(myWarehouseCode) : null;

        // Получаем или создаем бренд (если не указан — используем «Без бренда», не считаем ошибкой)
        const brandNameRaw = columnMap.brand !== undefined
          ? String(row[columnMap.brand] || '').trim()
          : 'Без бренда';
        const brandName = brandNameRaw || 'Без бренда';

        let brand = brandMap.get(brandName.toLowerCase());
        if (!brand) {
          const newBrand = { id: 'NEW', name: brandName, slug: generateSlug(brandName) } as any;
          brand = newBrand;
          brandMap.set(brandName.toLowerCase(), newBrand);
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
          sku: str(columnMap.sku),
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
                if (!raw) return [];
                return raw
                  .split(/[,;\n]+/)
                  .map((s: string) => s.trim())
                  .filter((s: string) => s && (s.startsWith('http://') || s.startsWith('https://')));
              })()
            : [],
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

    return NextResponse.json({
      products,
      errors,
      stats,
      columns: headers.map((h, i) => ({ index: i, name: h })),
      columnMap, // Для отладки
    });
  } catch (error: any) {
    console.error('Import parse error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при обработке файла' },
      { status: 500 }
    );
  }
}

