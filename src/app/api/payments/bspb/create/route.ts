import { NextRequest, NextResponse } from 'next/server';
import { BspbPaymentService } from '@/lib/bspb';

/**
 * POST /api/payments/bspb/create
 *
 * Body: { amount: number, title: string, description?: string, orderId?: string }
 * Returns: { paymentUrl, orderId, raw }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, title, description, orderId } = body;

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
    console.log('💳 [BSPB] Заказ создан:', { orderId: result.orderId, paymentUrl: result.paymentUrl, status: result.raw.status });

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
