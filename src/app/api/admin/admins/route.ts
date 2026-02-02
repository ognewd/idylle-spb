import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

// Получить список всех администраторов (только для авторизованных админов)
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        allowedAdminSections: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error: any) {
    console.error('FULL ERROR DETAILS:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении списка администраторов', details: error.message },
      { status: 500 }
    );
  }
}

// Создать нового администратора (только для авторизованных админов)
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();
    const { name, email, password, allowedAdminSections } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        allowedAdminSections: allowedAdminSections || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        allowedAdminSections: true,
      },
    });

    return NextResponse.json({
      success: true,
      admin: newAdmin,
      message: 'Администратор успешно создан',
    });
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании администратора' },
      { status: 500 }
    );
  }
}
