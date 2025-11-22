import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  termsAcceptedAt: z.string(),
  privacyAcceptedAt: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        termsAcceptedAt: new Date(validatedData.termsAcceptedAt),
        privacyAcceptedAt: new Date(validatedData.privacyAcceptedAt),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    // Link existing orders with this email to the new user
    const updatedOrders = await prisma.order.updateMany({
      where: {
        email: validatedData.email.toLowerCase(),
        userId: null,
      },
      data: {
        userId: user.id,
      },
    });

    console.log(`Linked ${updatedOrders.count} orders to user ${user.id}`);

    return NextResponse.json({
      message: 'Пользователь успешно зарегистрирован',
      user,
      linkedOrders: updatedOrders.count,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
