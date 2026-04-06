import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import { normalizeRoles } from '@/lib/panel-roles';

export async function GET(request: NextRequest) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const dealers = await prisma.dealerProfile.findMany({
      include: {
        users: {
          select: { id: true, email: true, name: true, isActive: true, roles: true, role: true },
        },
        brandAccesses: {
          include: { brand: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      dealers: dealers.map((d) => ({
        ...d,
        users: d.users.map((u) => ({ ...u, resolvedRoles: normalizeRoles(u.role, u.roles) })),
      })),
    });
  } catch (error) {
    console.error('Wholesale dealers GET error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось получить дилеров' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();
    const {
      companyName,
      contacts,
      requisites,
      requestId,
    } = body || {};

    if (!companyName || !contacts || !requisites) {
      return NextResponse.json({ success: false, error: 'Заполните все обязательные поля' }, { status: 400 });
    }

    const dealer = await prisma.dealerProfile.create({
      data: {
        companyName,
        contacts,
        requisites,
        status: 'active',
      },
    });

    if (requestId) {
      await prisma.dealerRequest.update({
        where: { id: String(requestId) },
        data: { status: 'approved' },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      dealer,
    });
  } catch (error) {
    console.error('Wholesale dealers POST error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось создать дилера' }, { status: 500 });
  }
}

