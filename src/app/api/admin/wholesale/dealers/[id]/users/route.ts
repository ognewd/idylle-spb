import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import { sendDealerCredentialsEmail } from '@/lib/mail';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const resolved = await Promise.resolve(params);
    const users = await prisma.user.findMany({
      where: { dealerProfileId: resolved.id, role: 'dealer' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Dealer users GET error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении пользователей дилера' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const resolved = await Promise.resolve(params);
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Имя, email и пароль обязательны' },
        { status: 400 }
      );
    }

    const dealer = await prisma.dealerProfile.findUnique({ where: { id: resolved.id } });
    if (!dealer) {
      return NextResponse.json(
        { success: false, error: 'Дилер не найден' },
        { status: 404 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: 'dealer',
        roles: ['dealer'],
        isActive: true,
        dealerProfileId: resolved.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    const mailResult = await sendDealerCredentialsEmail({
      to: email,
      userName: name,
      loginEmail: email,
      password,
      companyName: dealer.companyName,
    });

    return NextResponse.json({
      success: true,
      user,
      credentials: { email, password },
      emailSent: mailResult.success,
      emailError: mailResult.success ? undefined : mailResult.error,
      message: mailResult.success
        ? 'Пользователь создан, учётные данные отправлены на email'
        : 'Пользователь создан; письмо не отправлено — проверьте SMTP «Коммуникация с партнёрами» или передайте доступ вручную',
    });
  } catch (error: any) {
    console.error('Dealer users POST error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании пользователя дилера' },
      { status: 500 }
    );
  }
}

