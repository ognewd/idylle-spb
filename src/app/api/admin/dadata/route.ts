import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

const DADATA_API_KEY_KEY = 'DADATA_API_KEY';
const DADATA_SECRET_KEY = 'DADATA_SECRET';
const MASK = '******';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminToken(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const rows = await prisma.settings.findMany({
      where: { key: { in: [DADATA_API_KEY_KEY, DADATA_SECRET_KEY] } },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));

    let apiKey = map.get(DADATA_API_KEY_KEY) ?? process.env.DADATA_API_KEY ?? '';
    const fromDbSecret = map.get(DADATA_SECRET_KEY);
    const hasEnvSecret = !!process.env.DADATA_SECRET;
    const secretMasked = fromDbSecret ? MASK : hasEnvSecret ? MASK : '';

    return NextResponse.json({
      success: true,
      settings: {
        apiKey: apiKey || '',
        secret: secretMasked,
      },
      isFromEnv: !fromDbSecret && !map.get(DADATA_API_KEY_KEY),
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки настроек DaData' },
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

    const apiKey = typeof settings.apiKey === 'string' ? settings.apiKey.trim() : '';
    const secret = typeof settings.secret === 'string' ? settings.secret.trim() : '';

    await prisma.settings.upsert({
      where: { key: DADATA_API_KEY_KEY },
      update: { value: apiKey },
      create: { key: DADATA_API_KEY_KEY, value: apiKey },
    });

    if (secret && secret !== MASK) {
      await prisma.settings.upsert({
        where: { key: DADATA_SECRET_KEY },
        update: { value: secret },
        create: { key: DADATA_SECRET_KEY, value: secret },
      });
    }

    return NextResponse.json({ success: true, message: 'Настройки DaData сохранены' });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Ошибка сохранения настроек DaData' },
      { status: 500 }
    );
  }
}
