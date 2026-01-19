import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAINTENANCE_ENABLED_KEY = 'maintenance_enabled';
const MAINTENANCE_DATE_KEY = 'maintenance_date';

// Проверка авторизации админа
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'admin' || payload.role === 'super_admin') {
      return payload;
    }
  } catch (error) {
    return null;
  }
  return null;
}

/**
 * GET /api/admin/maintenance
 * Получить настройки режима обслуживания
 */
export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const enabledSetting = await prisma.settings.findUnique({
      where: { key: MAINTENANCE_ENABLED_KEY },
    });

    const dateSetting = await prisma.settings.findUnique({
      where: { key: MAINTENANCE_DATE_KEY },
    });

    // Правильно обрабатываем значение: может быть 'true'/'false' (строка) или true/false (boolean)
    let enabled = false;
    if (enabledSetting) {
      const value = enabledSetting.value;
      if (value === 'true' || value === true) {
        enabled = true;
      } else if (value === 'false' || value === false) {
        enabled = false;
      }
    }
    const maintenanceDate = dateSetting?.value || null;
    
    console.log('[Admin Maintenance API GET] Settings:', {
      enabled,
      enabledSettingValue: enabledSetting?.value,
      enabledSettingValueType: typeof enabledSetting?.value,
      maintenanceDate,
    });

    return NextResponse.json({
      enabled,
      maintenanceDate,
    });
  } catch (error) {
    console.error('Error fetching maintenance settings:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить настройки режима обслуживания' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/maintenance
 * Обновить настройки режима обслуживания
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { enabled, maintenanceDate } = await request.json();

    console.log('[Admin Maintenance API PATCH] Received:', {
      enabled,
      enabledType: typeof enabled,
      maintenanceDate,
    });

    // Обновляем статус включения/выключения
    // Всегда обновляем, даже если enabled === false
    if (typeof enabled === 'boolean') {
      const valueString = enabled.toString(); // 'true' или 'false'
      await prisma.settings.upsert({
        where: { key: MAINTENANCE_ENABLED_KEY },
        update: { value: valueString },
        create: {
          key: MAINTENANCE_ENABLED_KEY,
          value: valueString,
          type: 'boolean',
        },
      });
      
      // Проверяем, что значение сохранилось
      const saved = await prisma.settings.findUnique({
        where: { key: MAINTENANCE_ENABLED_KEY },
      });
      
      console.log('[Admin Maintenance API PATCH] Saved:', {
        enabled,
        savedValue: saved?.value,
        savedValueType: typeof saved?.value,
        matches: saved?.value === valueString,
      });
    } else {
      console.warn('[Admin Maintenance API PATCH] enabled is not boolean:', typeof enabled, enabled);
    }

    // Обновляем дату и время
    if (maintenanceDate !== undefined) {
      if (maintenanceDate) {
        await prisma.settings.upsert({
          where: { key: MAINTENANCE_DATE_KEY },
          update: { value: maintenanceDate },
          create: {
            key: MAINTENANCE_DATE_KEY,
            value: maintenanceDate,
            type: 'string',
          },
        });
      } else {
        // Если дата пустая, удаляем настройку
        await prisma.settings.deleteMany({
          where: { key: MAINTENANCE_DATE_KEY },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Настройки режима обслуживания обновлены',
      enabled: typeof enabled === 'boolean' ? enabled : undefined,
      maintenanceDate: maintenanceDate !== undefined ? maintenanceDate : undefined,
    });
  } catch (error) {
    console.error('Error updating maintenance settings:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить настройки режима обслуживания' },
      { status: 500 }
    );
  }
}
