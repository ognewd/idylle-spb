import { NextRequest, NextResponse } from 'next/server';
import { BspbPaymentService } from '@/lib/bspb';
import { prisma } from '@/lib/prisma';

const PAID_STATUSES = ['Paid', 'Approved', 'Completed', 'Deposited'];

/**
 * GET /api/payments/bspb/callback?id=<bspbOrderId>
 *
 * Called from /payment/result page after bank redirect.
 * Checks payment status in BSPB, optionally creates order from server-side data.
 */
export async function GET(request: NextRequest) {
  const bspbOrderId = request.nextUrl.searchParams.get('id');

  if (!bspbOrderId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const bankStatus = await BspbPaymentService.getOrderStatus(bspbOrderId);
    const isPaid = PAID_STATUSES.some((s) => bankStatus.status?.includes(s));

    // Check if order already exists in our DB
    const order = await prisma.order.findFirst({
      where: { bspbOrderId: String(bspbOrderId) },
      select: { id: true, orderNumber: true, firstName: true, paymentStatus: true, bspbStatus: true },
    });

    // Update order status if it exists and status changed
    if (order && order.bspbStatus !== bankStatus.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          bspbStatus: bankStatus.status,
          paymentStatus: isPaid ? 'paid' : order.paymentStatus,
          status: isPaid && order.paymentStatus !== 'paid' ? 'confirmed' : undefined,
        },
      });
    }

    // Retrieve server-side pending order data (if available)
    let pendingOrderData: string | null = null;
    if (isPaid && !order) {
      try {
        const pending = await prisma.pendingPayment.findUnique({
          where: { bspbOrderId: String(bspbOrderId) },
        });
        if (pending) {
          pendingOrderData = pending.orderData;
        }
      } catch {
        // Таблица может ещё не существовать — fallback на localStorage на клиенте
      }
    }

    return NextResponse.json({
      paid: isPaid,
      bankStatus: bankStatus.status,
      orderNumber: order?.orderNumber || null,
      firstName: order?.firstName || null,
      pendingOrderData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('BSPB callback error:', message);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: message },
      { status: 500 },
    );
  }
}
