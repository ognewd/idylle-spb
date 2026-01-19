import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAINTENANCE_ENABLED_KEY = 'maintenance_enabled';
const MAINTENANCE_DATE_KEY = 'maintenance_date';

/**
 * GET /api/maintenance
 * Получить публичные настройки режима обслуживания (для фронтенда)
 */
export async function GET() {
  try {
    const enabledSetting = await prisma.settings.findUnique({
      where: { key: MAINTENANCE_ENABLED_KEY },
    });

    const dateSetting = await prisma.settings.findUnique({
      where: { key: MAINTENANCE_DATE_KEY },
    });

    const enabled = enabledSetting ? enabledSetting.value === 'true' : false;
    const maintenanceDate = dateSetting?.value || null;

    const response = NextResponse.json({
      enabled,
      maintenanceDate,
    });
    
    // Отключаем кеширование для этого API
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching maintenance settings:', error);
    // По умолчанию режим обслуживания выключен
    return NextResponse.json({
      enabled: false,
      maintenanceDate: null,
    });
  }
}
