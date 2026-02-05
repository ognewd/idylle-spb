import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/admin-auth';

// Helper to verify admin token
const verifyAdminToken = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }
  const secret = getJwtSecret();
  if (!secret) return { error: 'Unauthorized', status: 500 };
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, secret) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return { error: 'Unauthorized', status: 401 };
    }
    return { user };
  } catch (jwtError) {
    return { error: 'Invalid token', status: 401 };
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();
    const { status, paymentStatus, notes, courierComment } = body;

    const updateData: Record<string, unknown> = {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(notes !== undefined && { notes }),
      ...(courierComment !== undefined && { courierComment }),
    };

    try {
      const order = await prisma.order.update({
        where: { id: params.id },
        data: updateData,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      return NextResponse.json({ order });
    } catch (updateError: unknown) {
      const errMsg = updateError instanceof Error ? updateError.message : String(updateError);
      const isMissingColumn = /courierComment|does not exist|Unknown column/i.test(errMsg);
      if (isMissingColumn && courierComment !== undefined) {
        delete updateData.courierComment;
        const mergedNotes =
          [notes, courierComment].filter(Boolean).join('\n\n[Комментарий для курьера]\n');
        if (mergedNotes) (updateData as any).notes = mergedNotes;
        const order = await prisma.order.update({
          where: { id: params.id },
          data: updateData,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
        return NextResponse.json({ order });
      }
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



