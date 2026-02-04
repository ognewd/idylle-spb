/**
 * Тест маппинга колонок и извлечения веса для импорта.
 * Данные: заголовки и одна строка товара «Ароматическая свеча CAFE SATIN 450 гр SKYLINE».
 */

const HEADERS = [
  'Код Мой склад',
  'Артикул производителя',
  'Полное название',
  'Краткое название',
  'Изображение',
  'Категория',
  'Тип категории',
  'Мест товара',
  'Доступно',
  'Цена продажи',
  'Описание аромата',
  'Основные ноты',
  'Объем, мл',
  'Вес, гр',
  'Размеры, см',
  'Назначение (Для какого помещения)',
  'Способ применения',
  'Бренд',
  'Страна происхождения бренда',
  'Страна производства',
  'Штрихкод',
];

// Одна строка данных: вес в колонке 13 = 950.00
const ROW = [
  '04950',
  '442112',
  'Ароматическая свеча CAFE SATIN 450 гр SKYLINE, арт. 442112',
  'Ароматическая свеча CAFE SATIN 450 гр',
  'https://idylle.spb.ru/wp-content/uploads/2025/02/442112.jpg',
  'Аромат для дома',
  'Ароматическая свеча',
  '1',
  2.00,   // Доступно — число из Excel
  18920.00, // Цена продажи
  'чувственный аромат...',
  'Верхние ноты: кофе...',
  '',     // Объем, мл — пусто
  950.00,  // Вес, гр — число из Excel
  '11,5 x 11,5 x 14 см',
  'Отели, гостиные...',
  'при первом использовании...',
  'Locherber Milano',
  'Италия',
  'Италия',
  '8021685631725',
];

function buildColumnMap(headersLower: string[]): Record<string, number> {
  const columnMap: Record<string, number> = {};

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
    } else if (normalized.includes('вес') && !normalized.includes('объем') && (normalized.includes('гр') || normalized.includes('грамм') || normalized.includes('г,') || normalized.includes('(г)'))) {
      columnMap.weight = index;
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
    } else if (normalized.includes('штрихкод') || normalized.includes('штрих код')) {
      columnMap.barcode = index;
    } else if (normalized.includes('габарит') || normalized.includes('размер') || normalized.includes('размеры') || normalized.includes('dimensions') || normalized.includes('см')) {
      columnMap.dimensions = index;
    }
  });

  // Резерв: поиск колонки веса
  if (columnMap.weight === undefined) {
    const weightIdx = headersLower.findIndex((h: string) => {
      const n = h.toLowerCase();
      return n.includes('вес') && !n.includes('объем') && (n.includes('гр') || n.includes('(г)') || n.includes('грамм'));
    });
    if (weightIdx >= 0) columnMap.weight = weightIdx;
  }

  return columnMap;
}

function parseWeight(rawWeight: unknown): number | null {
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
}

function main() {
  const headers = HEADERS.map((h) => String(h || '').trim());
  const headersLower = headers.map((h) => h.toLowerCase());

  console.log('=== Заголовки (индекс : значение) ===');
  headers.forEach((h, i) => console.log(`  ${i}: "${h}"`));

  console.log('\n=== Маппинг колонок ===');
  const columnMap = buildColumnMap(headersLower);
  console.log('  columnMap.weight =', columnMap.weight);
  console.log('  columnMap (все):', JSON.stringify(columnMap, null, 2));

  const rawWeight = columnMap.weight !== undefined ? ROW[columnMap.weight] : undefined;
  console.log('\n=== Значение из строки ===');
  console.log('  rawWeight (row[columnMap.weight]) =', rawWeight, typeof rawWeight);

  const weight = parseWeight(rawWeight);
  console.log('  parsed weight =', weight);

  console.log('\n=== Результат ===');
  if (columnMap.weight === undefined) {
    console.log('  ОШИБКА: колонка "Вес, гр" не найдена в маппинге.');
  } else if (weight === null) {
    console.log('  ОШИБКА: значение веса не распознано.');
  } else {
    console.log('  OK: вес =', weight);
  }
}

main();
