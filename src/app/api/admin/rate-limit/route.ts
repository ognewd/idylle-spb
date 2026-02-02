import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getRateLimitConfig, type RateLimitEndpointKey } from '@/lib/rate-limit';

const SETTINGS_KEY = 'RATE_LIMIT_CONFIG';

function toHumanConfig(config: Record<RateLimitEndpointKey, { windowMs: number; max: number }>) {
  return {
    adminLogin: { windowMinutes: Math.round(config.adminLogin.windowMs / 60000), max: config.adminLogin.max },
    register: { windowMinutes: Math.round(config.register.windowMs / 60000), max: config.register.max },
    orders: { windowMinutes: Math.round(config.orders.windowMs / 60000), max: config.orders.max },
    newsletter: { windowMinutes: Math.round(config.newsletter.windowMs / 60000), max: config.newsletter.max },
  };
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const config = await getRateLimitConfig();
    return NextResponse.json({ success: true, config: toHumanConfig(config) });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки настроек' },
      { status: 500 }
    );
  }
}

const ENDPOINT_KEYS: RateLimitEndpointKey[] = ['adminLogin', 'register', 'orders', 'newsletter'];

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const current = await getRateLimitConfig();
    const stored: Record<string, { windowMs: number; max: number }> = {};
    for (const key of ENDPOINT_KEYS) {
      const v = body[key];
      if (v && typeof v.windowMinutes === 'number' && typeof v.max === 'number') {
        stored[key] = {
          windowMs: Math.max(60 * 1000, v.windowMinutes * 60 * 1000),
          max: Math.max(1, Math.min(1000, v.max)),
        };
      } else {
        stored[key] = current[key as RateLimitEndpointKey];
      }
    }
    const value = JSON.stringify(stored);
    await prisma.settings.upsert({
      where: { key: SETTINGS_KEY },
      update: { value },
      create: { key: SETTINGS_KEY, value },
    });
    const config = await getRateLimitConfig();
    return NextResponse.json({
      success: true,
      message: 'Настройки сохранены',
      config: toHumanConfig(config),
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Ошибка сохранения настроек' },
      { status: 500 }
    );
  }
}
