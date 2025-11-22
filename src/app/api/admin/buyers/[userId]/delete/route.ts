import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Удалить пользователя
export async function DELETE(
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
        { success: false, error: 'Нельзя удалить администратора' },
        { status: 403 }
      );
    }

    // Check if user has orders
    const ordersCount = await prisma.order.count({
      where: { userId: userId },
    });

    if (ordersCount > 0) {
      // Не удаляем пользователя, а деактивируем
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Пользователь не может быть удален, т.к. имеет ${ordersCount} заказ(ов). Аккаунт деактивирован.`,
        action: 'deactivated',
      });
    }

    // Delete user (if no orders)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно удален',
      action: 'deleted',
    });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении пользователя' },
      { status: 500 }
    );
  }
}
