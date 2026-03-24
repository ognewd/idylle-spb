import { NextRequest, NextResponse } from 'next/server';
import { BspbPaymentService } from '@/lib/bspb';

/**
 * POST /api/payments/bspb/refund/[id]
 *
 * Initiates a refund for a BSPB order.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    let amount: number | undefined;
    try {
      const body = await request.json();
      if (body.amount && typeof body.amount === 'number') {
        amount = body.amount;
      }
    } catch {
      // empty body is fine — full refund
    }

    const result = await BspbPaymentService.refundOrder(orderId, amount);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('BSPB refund error:', message);
    return NextResponse.json(
      { error: 'Refund processing failed', details: message },
      { status: 500 },
    );
  }
}
