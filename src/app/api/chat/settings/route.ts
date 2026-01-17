import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CHAT_ENABLED_KEY = 'chat_enabled';

/**
 * GET /api/chat/settings
 * Получить настройку включения/выключения чата
 */
export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: CHAT_ENABLED_KEY },
    });

    // По умолчанию чат включен
    const isEnabled = setting ? setting.value === 'true' : true;

    return NextResponse.json({ enabled: isEnabled });
  } catch (error) {
    console.error('Error fetching chat settings:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить настройки чата' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/settings
 * Обновить настройку включения/выключения чата
 * Требуется авторизация админа
 */
export async function PATCH(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin' && payload.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Доступ запрещен' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      );
    }

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Параметр enabled должен быть boolean' },
        { status: 400 }
      );
    }

    // Создаем или обновляем настройку
    const setting = await prisma.settings.upsert({
      where: { key: CHAT_ENABLED_KEY },
      update: { value: enabled.toString() },
      create: {
        key: CHAT_ENABLED_KEY,
        value: enabled.toString(),
        type: 'boolean',
      },
    });

    return NextResponse.json({ 
      enabled: setting.value === 'true',
      message: enabled ? 'Чат включен' : 'Чат выключен',
    });
  } catch (error) {
    console.error('Error updating chat settings:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить настройки чата' },
      { status: 500 }
    );
  }
}
