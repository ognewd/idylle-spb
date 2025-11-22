import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Деактивировать пользователя
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role === 'admin' || user.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Нельзя деактивировать администратора' },
        { status: 403 }
      );
    }

    // Deactivate user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно деактивирован',
    });
  } catch (error) {
    console.error('Ошибка при деактивации пользователя:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при деактивации пользователя' },
      { status: 500 }
    );
  }
}

// Активировать пользователя обратно
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Activate user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно активирован',
    });
  } catch (error) {
    console.error('Ошибка при активации пользователя:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при активации пользователя' },
      { status: 500 }
    );
  }
}
