import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPanelToken } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyPanelToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  if (!authResult.isDealer || !authResult.dealerProfileId) {
    return NextResponse.json({ error: 'Доступно только дилеру' }, { status: 403 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        dealerProfileId: authResult.dealerProfileId,
        orderType: 'dealer',
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryMethod: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        inn: true,
        kpp: true,
        companyAddress: true,
        notes: true,
        subtotal: true,
        shipping: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            variantInfo: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Dealer order detail GET error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось получить заказ' }, { status: 500 });
  }
}

