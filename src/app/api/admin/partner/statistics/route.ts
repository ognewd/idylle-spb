import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPanelToken } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyPanelToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { user, isPartner, allowedBrandIds } = authResult;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
    }

    const brandFilter = isPartner && allowedBrandIds
      ? { product: { brandId: { in: allowedBrandIds } } }
      : {};

    const orderFilter: any = {
      ...brandFilter,
      order: {
        paymentStatus: 'paid',
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
    };

    const orderItems = await prisma.orderItem.findMany({
      where: orderFilter,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            brand: { select: { id: true, name: true } },
          },
        },
        order: {
          select: { createdAt: true },
        },
      },
    });

    const productStats: Record<string, {
      productId: string;
      productName: string;
      sku: string | null;
      brandName: string;
      totalQuantity: number;
      totalRevenue: number;
      currentStock: number;
    }> = {};

    for (const item of orderItems) {
      const key = item.productId;
      if (!productStats[key]) {
        productStats[key] = {
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku,
          brandName: item.product.brand.name,
          totalQuantity: 0,
          totalRevenue: 0,
          currentStock: item.product.stock,
        };
      }
      productStats[key].totalQuantity += item.quantity;
      productStats[key].totalRevenue += Number(item.price) * item.quantity;
    }

    const stats = Object.values(productStats).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const summary = {
      totalProducts: stats.length,
      totalItemsSold: stats.reduce((sum, s) => sum + s.totalQuantity, 0),
      totalRevenue: stats.reduce((sum, s) => sum + s.totalRevenue, 0),
    };

    return NextResponse.json({ success: true, stats, summary });
  } catch (error: any) {
    console.error('Partner statistics error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении статистики' },
      { status: 500 }
    );
  }
}
