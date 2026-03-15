import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

const KEY_PREFIX = 'EMAIL_TEMPLATE_';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (id === 'brand-cooperation') {
      const [subjectRow, htmlRow] = await Promise.all([
        prisma.settings.findUnique({ where: { key: `${KEY_PREFIX}brand_cooperation_subject` } }),
        prisma.settings.findUnique({ where: { key: `${KEY_PREFIX}brand_cooperation_html` } }),
      ]);
      return NextResponse.json({
        subject: subjectRow?.value ?? '',
        htmlBody: htmlRow?.value ?? '',
      });
    }

    return NextResponse.json({ error: 'Unknown template id' }, { status: 400 });
  } catch (error) {
    console.error('Service templates GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const id = body?.id;
    if (id !== 'brand-cooperation') {
      return NextResponse.json({ error: 'Unknown template id' }, { status: 400 });
    }

    const subject = typeof body.subject === 'string' ? body.subject : '';
    const htmlBody = typeof body.htmlBody === 'string' ? body.htmlBody : '';

    await Promise.all([
      prisma.settings.upsert({
        where: { key: `${KEY_PREFIX}brand_cooperation_subject` },
        update: { value: subject },
        create: { key: `${KEY_PREFIX}brand_cooperation_subject`, value: subject },
      }),
      prisma.settings.upsert({
        where: { key: `${KEY_PREFIX}brand_cooperation_html` },
        update: { value: htmlBody },
        create: { key: `${KEY_PREFIX}brand_cooperation_html`, value: htmlBody },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Service templates POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
