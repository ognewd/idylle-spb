import { NextRequest, NextResponse } from 'next/server';
import { BspbPaymentService } from '@/lib/bspb';

/**
 * GET /api/payments/bspb/status/[id]
 *
 * Returns the current status of a BSPB order.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const status = await BspbPaymentService.getOrderStatus(orderId);

    return NextResponse.json({ order: status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('BSPB status check error:', message);
    return NextResponse.json(
      { error: 'Failed to check order status', details: message },
      { status: 500 },
    );
  }
}
