import { NextRequest, NextResponse } from 'next/server';
import { BspbPaymentService } from '@/lib/bspb';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRateLimitOptionsForEndpoint } from '@/lib/rate-limit';

/**
 * POST /api/payments/bspb/create
 *
 * Body: { amount: number, title: string, description?: string, orderId?: string, orderPayload?: object }
 * Returns: { paymentUrl, orderId, status }
 */
export async function POST(request: NextRequest) {
  const opts = await getRateLimitOptionsForEndpoint('payments');
  const rateLimitResponse = checkRateLimit(request, opts);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { amount, title, description, orderId, orderPayload } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount: must be a positive number' },
        { status: 400 },
      );
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 },
      );
    }

    console.log('💳 [BSPB] Создаём заказ:', { amount, title, description });
    const result = await BspbPaymentService.createOrder({
      amount,
      title: orderId ? `${title} (${orderId})` : title,
      description: description || title,
    });
    console.log('💳 [BSPB] Заказ создан:', { orderId: result.orderId, status: result.raw.status });

    // Сохраняем данные заказа на сервере — при возврате из банка берём отсюда, а не из localStorage
    if (orderPayload) {
      try {
        await prisma.pendingPayment.create({
          data: {
            bspbOrderId: String(result.orderId),
            orderData: JSON.stringify(orderPayload),
            amount,
          },
        });
      } catch (e) {
        console.warn('💳 [BSPB] Не удалось сохранить pending payment:', e);
      }
    }

    return NextResponse.json({
      paymentUrl: result.paymentUrl,
      orderId: result.orderId,
      status: result.raw.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [BSPB] Ошибка создания заказа:', message);
    return NextResponse.json(
      { error: 'Payment processing failed', details: message },
      { status: 500 },
    );
  }
}
