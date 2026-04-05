import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** Публичный список сертификатов для страницы сайта */
export async function GET() {
  try {
    const certificates = await prisma.siteCertificate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileName: true,
        mimeType: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { certificates },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (e) {
    console.error('public certificates GET', e);
    return NextResponse.json({ certificates: [] }, { status: 200 });
  }
}
