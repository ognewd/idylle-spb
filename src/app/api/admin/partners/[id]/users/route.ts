import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import { sendPartnerCredentialsEmail } from '@/lib/mail';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const users = await prisma.user.findMany({
      where: { partnerId: params.id, role: 'partner' },
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
    console.error('Partner users GET error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении пользователей партнёра' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Имя, email и пароль обязательны' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Партнёр не найден' },
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
        role: 'partner',
        roles: ['partner'],
        isActive: true,
        partnerId: params.id,
        allowedAdminSections: ['products', 'partner-statistics'],
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

    const mailResult = await sendPartnerCredentialsEmail({
      to: email,
      userName: name,
      loginEmail: email,
      password,
      partnerName: partner.name,
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
    console.error('Partner user POST error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании пользователя партнёра' },
      { status: 500 }
    );
  }
}
