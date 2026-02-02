import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

const CDEK_CLIENT_ID_KEY = 'CDEK_CLIENT_ID';
const CDEK_CLIENT_SECRET_KEY = 'CDEK_CLIENT_SECRET';
const MASK = '******';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const rows = await prisma.settings.findMany({
      where: { key: { in: [CDEK_CLIENT_ID_KEY, CDEK_CLIENT_SECRET_KEY] } },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));

    let clientId = map.get(CDEK_CLIENT_ID_KEY) ?? process.env.CDEK_CLIENT_ID ?? '';
    const fromDbSecret = map.get(CDEK_CLIENT_SECRET_KEY);
    const hasEnvSecret = !!process.env.CDEK_CLIENT_SECRET;
    const clientSecretMasked = fromDbSecret ? MASK : hasEnvSecret ? MASK : '';

    return NextResponse.json({
      success: true,
      settings: {
        clientId: clientId || '',
        clientSecret: clientSecretMasked,
      },
      isFromEnv: !fromDbSecret && !map.get(CDEK_CLIENT_ID_KEY),
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки настроек СДЕК' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { action, settings } = body;

    if (action !== 'save-settings' || !settings) {
      return NextResponse.json(
        { success: false, error: 'Требуется action: "save-settings" и объект settings' },
        { status: 400 }
      );
    }

    const clientId = typeof settings.clientId === 'string' ? settings.clientId.trim() : '';
    const clientSecret = typeof settings.clientSecret === 'string' ? settings.clientSecret.trim() : '';

    await prisma.settings.upsert({
      where: { key: CDEK_CLIENT_ID_KEY },
      update: { value: clientId },
      create: { key: CDEK_CLIENT_ID_KEY, value: clientId },
    });

    if (clientSecret && clientSecret !== MASK) {
      await prisma.settings.upsert({
        where: { key: CDEK_CLIENT_SECRET_KEY },
        update: { value: clientSecret },
        create: { key: CDEK_CLIENT_SECRET_KEY, value: clientSecret },
      });
    }

    return NextResponse.json({ success: true, message: 'Настройки СДЕК сохранены' });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Ошибка сохранения настроек СДЕК' },
      { status: 500 }
    );
  }
}
