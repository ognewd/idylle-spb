import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPanelToken } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyPanelToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  if (!authResult.isDealer || !authResult.dealerProfileId) {
    return NextResponse.json({ error: 'Доступно только дилеру' }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        dealerProfileId: authResult.dealerProfileId,
        orderType: 'dealer',
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Dealer orders GET error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось получить заказы дилера' }, { status: 500 });
  }
}

