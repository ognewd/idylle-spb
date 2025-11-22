import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const subscribeSchema = z.object({
  email: z.string().email(),
  acceptMarketing: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, acceptMarketing } = subscribeSchema.parse(body);

    if (!acceptMarketing) {
      return NextResponse.json(
        { error: 'Необходимо согласие на получение рассылки' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { error: 'Этот email уже подписан на рассылку' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await prisma.newsletter.update({
          where: { email },
          data: {
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        });

        return NextResponse.json({
          message: 'Подписка восстановлена. Проверьте email для подтверждения.',
        });
      }
    }

    // Create new subscription
    await prisma.newsletter.create({
      data: {
        email,
        isActive: true,
        subscribedAt: new Date(),
      },
    });

    // TODO: Send confirmation email if needed

    return NextResponse.json({
      message: 'Подписка оформлена. Проверьте email для подтверждения.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
