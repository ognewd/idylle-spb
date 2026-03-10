import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import phash from 'sharp-phash';
import distance from 'sharp-phash/distance';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/admin-auth';

/** Порог: расстояние Хэмминга между perceptual hash меньше этого = считаем дубликатом */
const PHASH_DUPLICATE_THRESHOLD = 6;

/**
 * POST /api/admin/products/[id]/dedupe-images
 * Удаляет дубликаты по визуальному сходству (perceptual hash). Оставляем первое по sortOrder, затем по createdAt.
 * Находит дубли даже при разном сжатии/размере/формате.
 */
function getFilePath(url: string): string {
  const baseUploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads');
  const filename = url.replace(/^.*\//, '').replace(/\?.*$/, '');
  return join(baseUploadsDir, 'products', filename);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = getJwtSecret();
    if (!secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 500 });

    const decoded = jwt.verify(authHeader.substring(7), secret) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, url: true },
    });

    const keptHashes: { id: string; hash: string }[] = []; // первое вхождение каждого визуально уникального
    const idsToDelete: string[] = [];
    const baseDir = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads');
    let filesRead = 0;

    for (const img of images) {
      const filePath = getFilePath(img.url);
      let imgHash: string;
      try {
        if (!existsSync(filePath)) {
          if (images.length <= 3) console.log('[dedupe-images] Файл не найден:', filePath);
          continue;
        }
        const buffer = await readFile(filePath);
        imgHash = await phash(buffer);
        filesRead++;
      } catch (e) {
        if (images.length <= 3) console.log('[dedupe-images] Ошибка чтения:', filePath, e);
        continue;
      }
      const isDuplicate = keptHashes.some(
        (k) => distance(k.hash, imgHash) < PHASH_DUPLICATE_THRESHOLD
      );
      if (isDuplicate) {
        idsToDelete.push(img.id);
      } else {
        keptHashes.push({ id: img.id, hash: imgHash });
      }
    }

    if (idsToDelete.length === 0) {
      let message = 'Дубликатов не найдено';
      if (images.length > 0 && filesRead === 0) {
        message = `Дубликатов не найдено. Файлы с диска не прочитаны (путь: ${join(baseDir, 'products')}). На проде задайте UPLOADS_DIR или проверьте, что файлы лежат в public/uploads/products.`;
      } else if (images.length > 0 && filesRead === images.length) {
        message = 'Дубликатов не найдено — все изображения визуально уникальны.';
      }
      return NextResponse.json({ success: true, deleted: 0, message });
    }

    await prisma.productImage.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    return NextResponse.json({
      success: true,
      deleted: idsToDelete.length,
      message: `Удалено дубликатов: ${idsToDelete.length}`,
    });
  } catch (error: any) {
    console.error('Dedupe images error:', error);
    return NextResponse.json(
      { error: error?.message || 'Ошибка при удалении дубликатов' },
      { status: 500 }
    );
  }
}
