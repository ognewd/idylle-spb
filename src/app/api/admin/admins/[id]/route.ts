import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получить информацию об администраторе
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: {
          in: ['admin', 'super_admin'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        allowedAdminSections: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Администратор не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error('Ошибка при получении администратора:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении администратора' },
      { status: 500 }
    );
  }
}

// Обновить администратора (статус или права доступа)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isActive, allowedAdminSections } = body;

    // Подготавливаем данные для обновления
    const updateData: any = {};
    
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    
    if (Array.isArray(allowedAdminSections)) {
      updateData.allowedAdminSections = allowedAdminSections;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Нет данных для обновления' },
        { status: 400 }
      );
    }

    const updatedAdmin = await prisma.user.update({
      where: {
        id: params.id,
        role: {
          in: ['admin', 'super_admin'],
        },
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        allowedAdminSections: true,
        updatedAt: true,
      },
    });

    let message = 'Администратор обновлен';
    if (typeof isActive === 'boolean') {
      message = `Администратор ${isActive ? 'активирован' : 'деактивирован'}`;
    }
    if (Array.isArray(allowedAdminSections)) {
      message = 'Права доступа обновлены';
    }

    return NextResponse.json({
      success: true,
      admin: updatedAdmin,
      message,
    });
  } catch (error) {
    console.error('Ошибка при обновлении администратора:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении администратора' },
      { status: 500 }
    );
  }
}

// Удалить администратора
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем, что это не последний администратор
    const adminCount = await prisma.user.count({
      where: { role: 'admin' },
    });

    if (adminCount <= 1) {
      return NextResponse.json(
        { success: false, error: 'Нельзя удалить последнего администратора' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: {
        id: params.id,
        role: 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Администратор удален',
    });
  } catch (error) {
    console.error('Ошибка при удалении администратора:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении администратора' },
      { status: 500 }
    );
  }
}
