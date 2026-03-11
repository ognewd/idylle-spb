import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/admin-auth';
import jwt from 'jsonwebtoken';

function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const secret = getJwtSecret();
  if (!secret) return null;
  try {
    return jwt.verify(authHeader.substring(7), secret) as { userId: string };
  } catch {
    return null;
  }
}

function parseNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  const s = String(val).trim().replace(/,/g, '.');
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

/**
 * POST /api/admin/import/apply-stock-update
 * Обновление только остатков (и опционально цены) по коду Мой склад.
 * В файле ожидаются колонки: Код Мой склад, Остаток (или Доступно), опционально Цена.
 * Товары не удаляются, фото не трогаем.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: admin.userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Файл не загружен' }, { status: 400 });
    if (!file.name.match(/\.(xls|xlsx)$/i)) {
      return NextResponse.json({ error: 'Поддерживаются только Excel (.xls, .xlsx)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown[][];

    if (rows.length < 2) {
      return NextResponse.json({ error: 'В файле нет данных (нужна строка заголовков и хотя бы одна строка)' }, { status: 400 });
    }

    const headers = (rows[0] as unknown[]).map((h) => String(h ?? '').toLowerCase().trim());
    let codeCol = -1;
    let stockCol = -1;
    let priceCol = -1;

    const codeNames = ['код мой склад', 'код мс', 'код мойсклад', 'mywarehousecode'];
    const stockNames = ['остаток', 'доступно', 'остатки', 'stock', 'количество'];
    const priceNames = ['цена продажи', 'цена', 'price'];

    headers.forEach((h, i) => {
      const n = String(h).toLowerCase().trim();
      if (codeCol < 0 && codeNames.some((c) => n.includes(c))) codeCol = i;
      if (stockCol < 0 && stockNames.some((s) => n.includes(s))) stockCol = i;
      if (priceCol < 0 && priceNames.some((p) => n.includes(p))) priceCol = i;
    });

    if (codeCol < 0) {
      return NextResponse.json({ error: 'В файле не найдена колонка «Код Мой склад»' }, { status: 400 });
    }
    if (stockCol < 0) {
      return NextResponse.json({ error: 'В файле не найдена колонка «Остаток» или «Доступно»' }, { status: 400 });
    }

    const items: { myWarehouseCode: string; stock: number; price: number | null }[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as unknown[];
      const code = String(row[codeCol] ?? '').trim();
      if (!code) continue;
      const stockVal = parseNum(row[stockCol]);
      const stock = stockVal !== null ? Math.max(0, Math.floor(stockVal)) : 0;
      const price = priceCol >= 0 ? parseNum(row[priceCol]) : null;
      items.push({ myWarehouseCode: code, stock, price: price !== null ? price : null });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'В файле нет строк с кодом Мой склад' }, { status: 400 });
    }

    const notFound: string[] = [];
    let updated = 0;

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: { myWarehouseCode: item.myWarehouseCode },
        select: { id: true },
      });
      if (!product) {
        notFound.push(item.myWarehouseCode);
        continue;
      }
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: item.stock,
          ...(item.price !== null && { price: item.price }),
        },
      });
      updated++;
    }

    return NextResponse.json({
      success: true,
      updated,
      notFound,
      total: items.length,
      message: `Обновлено: ${updated}. Не найдено на сайте: ${notFound.length} кодов.`,
    });
  } catch (e) {
    console.error('apply-stock-update error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Ошибка обновления остатков' },
      { status: 500 }
    );
  }
}
