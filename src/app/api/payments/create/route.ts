import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentMethodId, returnUrl } = await request.json();

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get payment method
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod || !paymentMethod.isActive) {
      return NextResponse.json({ error: 'Payment method not available' }, { status: 400 });
    }

    let paymentResult;

    switch (paymentMethod.type) {
      case 'card':
        // Try Stripe first, fallback to YooKassa
        try {
          paymentResult = await PaymentService.createStripePaymentIntent(
            Number(order.total),
            order.id
          );
        } catch (error) {
          console.log('Stripe failed, trying YooKassa:', error);
          paymentResult = await PaymentService.createYooKassaPayment(
            Number(order.total),
            order.id,
            returnUrl
          );
        }
        break;

      case 'bank_transfer':
        // For bank transfer, return company details
        paymentResult = {
          type: 'bank_transfer',
          details: PaymentService.getBankTransferDetails(),
          orderNumber: order.orderNumber,
          amount: Number(order.total),
        };
        break;

      case 'cash_delivery':
      case 'cash_pickup':
        // For cash payments, just confirm
        paymentResult = {
          type: paymentMethod.type,
          confirmed: true,
          orderNumber: order.orderNumber,
          amount: Number(order.total),
        };
        break;

      default:
        return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 });
    }

    return NextResponse.json(paymentResult);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
