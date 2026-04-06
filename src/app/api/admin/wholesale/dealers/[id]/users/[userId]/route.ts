import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> | { id: string; userId: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const resolved = await Promise.resolve(params);
    const body = await request.json();
    const { isActive, name, password } = body;

    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: resolved.userId, dealerProfileId: resolved.id, role: 'dealer' },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Dealer user PATCH error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении пользователя' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> | { id: string; userId: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const resolved = await Promise.resolve(params);
    await prisma.user.delete({
      where: { id: resolved.userId, dealerProfileId: resolved.id, role: 'dealer' },
    });

    return NextResponse.json({ success: true, message: 'Пользователь удалён' });
  } catch (error: any) {
    console.error('Dealer user DELETE error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении пользователя' },
      { status: 500 }
    );
  }
}

