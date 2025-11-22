import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Сбросить пароль пользователя
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Generate new random password
    const newPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // TODO: Send email with new password
    // await sendPasswordResetEmail(user.email, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно сброшен',
      newPassword, // Временно возвращаем пароль (в продакшене нужно отправлять на email)
    });
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при сбросе пароля' },
      { status: 500 }
    );
  }
}
