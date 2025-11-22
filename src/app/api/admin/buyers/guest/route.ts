import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Удалить заказы гостя по email
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email обязателен' },
        { status: 400 }
      );
    }

    // Find all guest orders (without userId) with this email
    const orders = await prisma.order.findMany({
      where: {
        email: email.toLowerCase(),
        userId: null,
      },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Заказы гостя не найдены' },
        { status: 404 }
      );
    }

    // Delete all orders for this guest
    await prisma.order.deleteMany({
      where: {
        email: email.toLowerCase(),
        userId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Удалено ${orders.length} заказ(ов) гостя`,
      deletedOrders: orders.length,
    });
  } catch (error) {
    console.error('Ошибка при удалении заказов гостя:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении заказов гостя' },
      { status: 500 }
    );
  }
}
