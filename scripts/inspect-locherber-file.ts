/**
 * Читает файл "Locherber Сайт часть 1.xls" и выводит заголовки и первую строку данных.
 * Нужно для отладки маппинга веса и размеров.
 */
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'Locherber Сайт часть 1.xls');

function main() {
  let buffer: Buffer;
  try {
    buffer = readFileSync(filePath);
  } catch (e) {
    console.error('Файл не найден:', filePath);
    process.exit(1);
  }

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

  if (rows.length < 2) {
    console.error('В файле меньше 2 строк');
    process.exit(1);
  }

  const headers = rows[0];
  const firstRow = rows[1];

  console.log('=== Заголовки (как в файле) ===');
  headers.forEach((h: any, i: number) => {
    const str = String(h ?? '');
    const type = typeof h;
    const codes = str.slice(0, 50).split('').map((c) => c.charCodeAt(0));
    console.log(`  [${i}] type=${type} value="${str.slice(0, 60)}${str.length > 60 ? '...' : ''}"`);
    if (str.length <= 20 && codes.some((c) => c > 127)) {
      console.log(`       charCodes: ${codes.join(',')}`);
    }
  });

  const normalizeHeader = (s: string) =>
    s.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[\u00a0\u2007\u202f]/g, ' ')
      .replace(/[,，\u060c\u3001]/g, ',')
      .trim();
  const headersLower = headers.map((h: any) => normalizeHeader(String(h ?? '').trim()));

  console.log('\n=== Поиск колонок "Вес" и "Размеры" (после нормализации) ===');
  headersLower.forEach((h: string, i: number) => {
    if (h.includes('вес') || h.includes('размер') || h.includes('габарит')) {
      console.log(`  [${i}] "${headers[i]}" -> normalized: "${h}"`);
      console.log(`       first row value: ${JSON.stringify(firstRow[i])} (type: ${typeof firstRow[i]})`);
    }
  });

  // Проверка маппинга веса: вес + (гр или кг)
  const weightIdx = headersLower.findIndex((h: string) => {
    const n = h;
    return n.includes('вес') && !n.includes('объем') && (n.includes('гр') || n.includes('кг') || n.includes('(г)'));
  });
  console.log('\n=== Маппинг weight (после добавления "кг") ===');
  console.log('  columnMap.weight будет:', weightIdx >= 0 ? weightIdx : 'не найден');

  const dimensionsIdx = headersLower.findIndex((h: string) =>
    h.includes('габарит') || h.includes('размер') || h.includes('размеры') || h.includes('см')
  );
  console.log('  columnMap.dimensions будет:', dimensionsIdx >= 0 ? dimensionsIdx : 'не найден');

  console.log('\n=== Первая строка данных (индекс : значение) ===');
  firstRow.forEach((v: any, i: number) => {
    const display = v !== undefined && v !== null && v !== '' ? String(v).slice(0, 50) : '(пусто)';
    console.log(`  [${i}] ${display}`);
  });
}

main();
