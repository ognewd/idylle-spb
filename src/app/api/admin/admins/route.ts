import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Получить список всех администраторов
export async function GET(request: NextRequest) {
  try {
    console.log('DEBUG: Starting GET /api/admin/admins');
    console.log('DEBUG: DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
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

    console.log('DEBUG: Found admins:', admins.length);

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

// Создать нового администратора
export async function POST(request: NextRequest) {
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
