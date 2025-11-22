import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import * as XLSX from 'xlsx';
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
    const headersLower = headers.map((h: string) => h.toLowerCase());
    
    // Если передан маппинг от пользователя, используем его, иначе автоопределяем
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
      // Автоопределение маппинга
      headersLower.forEach((header: string, index: number) => {
        const normalized = header.toLowerCase();
        if (normalized.includes('код мой склад')) {
          columnMap.myWarehouseCode = index;
        } else if (normalized.includes('артикул производителя')) {
          columnMap.manufacturerSku = index;
        } else if (normalized.includes('наименование')) {
          columnMap.name = index;
        } else if (normalized.includes('для фильтра')) {
          columnMap.productType = index;
        } else if (normalized.includes('категория')) {
          columnMap.category = index;
        } else if (normalized.includes('доступно')) {
          columnMap.stock = index;
        } else if (normalized.includes('цена продажи')) {
          columnMap.price = index;
        } else if (normalized.includes('описание аромата')) {
          columnMap.aromaDescription = index;
        } else if (normalized.includes('основные ноты')) {
          columnMap.topNotes = index;
        } else if (normalized.includes('объем') || normalized.includes('обьем')) {
          columnMap.volume = index;
        } else if (normalized.includes('назначение')) {
          columnMap.purpose = index;
        } else if (normalized.includes('бренд')) {
          columnMap.brand = index;
        } else if (normalized.includes('страна')) {
          columnMap.country = index;
        } else if (normalized.includes('штрихкод') || normalized.includes('штрих код')) {
          columnMap.barcode = index;
        }
      });
    }

    // Если только получаем колонки (без маппинга), возвращаем список колонок
    if (!columnMappingJson) {
      // Подготовим превью первых 5 строк (без заголовка)
      const rowsPreview = rows.slice(1, Math.min(rows.length, 6));
      return NextResponse.json({
        columns: headers.map((h, i) => ({ index: i, name: h })),
        suggestedMapping: columnMap,
        totalRows: rows.length - 1,
        rowsPreview, // массив массивов значений
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

        // Получаем или создаем бренд
        const brandName = columnMap.brand !== undefined 
          ? String(row[columnMap.brand] || '').trim() 
          : 'Без бренда';
        
        let brand = brandMap.get(brandName.toLowerCase());
        if (!brand && brandName) {
          // Бренд будет создан при импорте
          const newBrand = { id: 'NEW', name: brandName, slug: generateSlug(brandName) } as any;
          brand = newBrand;
          brandMap.set(brandName.toLowerCase(), newBrand);
        }

        if (!brand) {
          errors.push(`Строка ${rowNum}: не указан бренд`);
          continue;
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

        // Цена и остаток
        const priceStr = columnMap.price !== undefined ? String(row[columnMap.price] || '').trim() : '';
        const stockStr = columnMap.stock !== undefined ? String(row[columnMap.stock] || '').trim() : '';
        
        const price = priceStr ? parseFloat(priceStr.replace(/,/g, '.')) || 0 : 0;
        const stock = stockStr ? parseInt(stockStr) || 0 : 0;

        // Объем
        const volume = normalizeVolume(
          columnMap.volume !== undefined ? row[columnMap.volume] : undefined
        );

        // Сохраняем все колонки из файла
        const rawData: Record<number, any> = {};
        row.forEach((value: any, index: number) => {
          rawData[index] = value;
        });

        const product: any = {
          rowNum,
          name,
          myWarehouseCode,
          manufacturerSku: columnMap.manufacturerSku !== undefined 
            ? String(row[columnMap.manufacturerSku] || '').trim() || null 
            : null,
          productType: columnMap.productType !== undefined 
            ? String(row[columnMap.productType] || '').trim() || null 
            : null,
          categoryName: category?.name || categoryName || null,
          categoryId: category?.id || null,
          stock,
          price,
          aromaDescription: columnMap.aromaDescription !== undefined 
            ? String(row[columnMap.aromaDescription] || '').trim() || null 
            : null,
          topNotes: columnMap.topNotes !== undefined 
            ? String(row[columnMap.topNotes] || '').trim() || null 
            : null,
          volume,
          purpose: columnMap.purpose !== undefined 
            ? String(row[columnMap.purpose] || '').trim() || null 
            : null,
          brandName: brand.name,
          brandId: brand.id,
          country: columnMap.country !== undefined 
            ? String(row[columnMap.country] || '').trim() || null 
            : null,
          barcode: columnMap.barcode !== undefined 
            ? String(row[columnMap.barcode] || '').trim() || null 
            : null,
          isUpdate: !!existingProduct,
          existingProductId: existingProduct?.id || null,
          rawData, // Все колонки из файла
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

