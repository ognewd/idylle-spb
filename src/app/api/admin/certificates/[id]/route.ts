import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaSiteCertificatesReady } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

function stalePrismaCertificatesResponse() {
  return NextResponse.json(
    {
      error:
        'Устарел Prisma Client в памяти. Остановите dev (Ctrl+C) и снова запустите npm run dev. При необходимости удалите .next и перезапустите.',
    },
    { status: 503 }
  );
}

function diskPathFromUrl(fileUrl: string): string | null {
  if (!fileUrl.startsWith('/uploads/certificates/')) return null;
  const name = fileUrl.slice('/uploads/certificates/'.length);
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) return null;
  const baseUploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads');
  return join(baseUploadsDir, 'certificates', name);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminToken(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!prismaSiteCertificatesReady()) {
      return stalePrismaCertificatesResponse();
    }

    const body = await request.json();
    const { title, sortOrder, isActive } = body as {
      title?: string;
      sortOrder?: number;
      isActive?: boolean;
    };

    const data: {
      title?: string;
      sortOrder?: number;
      isActive?: boolean;
    } = {};
    if (typeof title === 'string' && title.trim()) data.title = title.trim();
    if (typeof sortOrder === 'number' && Number.isFinite(sortOrder)) data.sortOrder = Math.floor(sortOrder);
    if (typeof isActive === 'boolean') data.isActive = isActive;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    const row = await prisma.siteCertificate.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ certificate: row });
  } catch (e) {
    console.error('admin certificates PATCH', e);
    return NextResponse.json({ error: 'Не удалось обновить' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminToken(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!prismaSiteCertificatesReady()) {
      return stalePrismaCertificatesResponse();
    }

    const row = await prisma.siteCertificate.findUnique({
      where: { id: params.id },
    });
    if (!row) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
    }

    const p = diskPathFromUrl(row.fileUrl);
    if (p && existsSync(p)) {
      try {
        unlinkSync(p);
      } catch (err) {
        console.error('certificate file unlink', err);
      }
    }

    await prisma.siteCertificate.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('admin certificates DELETE', e);
    return NextResponse.json({ error: 'Не удалось удалить' }, { status: 500 });
  }
}
