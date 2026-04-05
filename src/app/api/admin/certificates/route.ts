import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma, prismaSiteCertificatesReady } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import {
  CERTIFICATE_MAX_BYTES,
  canApplyLogoWatermark,
  extFromFileName,
  isCertificateAllowed,
  normalizeCertificateMime,
} from '@/lib/certificates/file-types';
import { watermarkPdf, watermarkRasterImage } from '@/lib/certificates/watermark';

function randomSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function stalePrismaResponse() {
  return NextResponse.json(
    {
      error:
        'Prisma Client в памяти процесса устарел (нет модели сертификатов). Сделайте: 1) в терминале полностью остановите dev (Ctrl+C); 2) снова npm run dev. Только перезапуск подхватывает новый клиент после db:push/generate. Если не помогло — удалите папку .next и снова npm run dev.',
    },
    { status: 503 }
  );
}

function jsonFromPrismaOrUnknown(e: unknown, fallback: string) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2021') {
      return NextResponse.json(
        {
          error:
            'Таблица «site_certificates» отсутствует в базе. Выполните: npx prisma db push (или миграцию) и перезапустите dev-сервер.',
        },
        { status: 503 }
      );
    }
  }
  const msg = e instanceof Error ? e.message : fallback;
  return NextResponse.json(
    {
      error: process.env.NODE_ENV === 'development' ? msg : fallback,
      ...(process.env.NODE_ENV === 'development' && e instanceof Error && e.stack
        ? { detail: e.stack.split('\n').slice(0, 5).join('\n') }
        : {}),
    },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!prismaSiteCertificatesReady()) {
      return stalePrismaResponse();
    }

    const items = await prisma.siteCertificate.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ certificates: items });
  } catch (e) {
    console.error('admin certificates GET', e);
    return jsonFromPrismaOrUnknown(e, 'Internal server error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const title = String(formData.get('title') || '').trim();
    const file = formData.get('file');
    const applyWatermark = formData.get('watermark') !== 'false';

    if (!title) {
      return NextResponse.json({ error: 'Укажите название' }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Добавьте файл' }, { status: 400 });
    }

    const ext = extFromFileName(file.name);
    const mime = normalizeCertificateMime((file.type || '').trim(), ext);
    if (!isCertificateAllowed(mime, ext)) {
      return NextResponse.json(
        {
          error:
            'Недопустимый тип файла. Разрешены: PDF, изображения, Excel (.xlsx, .xls), Word (.doc, .docx)',
        },
        { status: 400 }
      );
    }

    if (file.size > CERTIFICATE_MAX_BYTES) {
      return NextResponse.json(
        { error: `Файл слишком большой (макс. ${Math.round(CERTIFICATE_MAX_BYTES / 1024 / 1024)} МБ)` },
        { status: 400 }
      );
    }

    if (!prismaSiteCertificatesReady()) {
      return stalePrismaResponse();
    }

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    let watermarked = false;
    if (applyWatermark) {
      const kind = canApplyLogoWatermark(mime);
      try {
        if (kind === 'image') {
          buffer = Buffer.from(await watermarkRasterImage(buffer, mime));
          watermarked = true;
        } else if (kind === 'pdf') {
          buffer = Buffer.from(await watermarkPdf(buffer));
          watermarked = true;
        }
      } catch (err) {
        console.error('Certificate watermark failed', err);
      }
    }

    const baseUploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads');
    const uploadsDir = join(baseUploadsDir, 'certificates');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${randomSuffix()}.${ext}`;
    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/certificates/${filename}`;
    const maxOrder = await prisma.siteCertificate.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    const row = await prisma.siteCertificate.create({
      data: {
        title,
        fileUrl,
        fileName: file.name,
        mimeType: mime,
        fileSize: buffer.length,
        watermarked,
        sortOrder,
        isActive: true,
      },
    });

    return NextResponse.json({ certificate: row });
  } catch (e) {
    console.error('admin certificates POST', e);
    return jsonFromPrismaOrUnknown(e, 'Internal server error');
  }
}
