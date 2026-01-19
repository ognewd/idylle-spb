import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/reviews
 * Создание отзыва на товар (на модерацию)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, rating, title, comment, userName, userEmail } = body;

    // Валидация
    if (!productId || !rating) {
      return NextResponse.json(
        { error: 'Необходимо указать productId и rating' },
        { status: 400 }
      );
    }

    // Если userId не указан, нужны userName и userEmail
    if (!userId && (!userName || !userEmail)) {
      return NextResponse.json(
        { error: 'Для анонимного отзыва необходимо указать имя и email' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть от 1 до 5' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли товар
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Если userId указан, проверяем существование пользователя
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Пользователь не найден' },
          { status: 404 }
        );
      }

      // Проверяем, не оставлял ли пользователь уже отзыв на этот товар (только для авторизованных)
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          productId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: 'Вы уже оставили отзыв на этот товар' },
          { status: 400 }
        );
      }
    }

    // Создаем отзыв на модерацию (isApproved = false)
    const reviewData: any = {
      product: {
        connect: { id: productId },
      },
      rating,
      title: title || null,
      comment: comment || null,
      userName: userName || null,
      userEmail: userEmail || null,
      isApproved: false, // На модерацию
      isVerified: false,
    };

    // Если userId указан, добавляем связь с пользователем
    if (userId) {
      reviewData.user = {
        connect: { id: userId },
      };
    }

    const review = await prisma.review.create({
      data: reviewData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Отзыв отправлен на модерацию',
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isApproved: review.isApproved,
        createdAt: review.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    // Обработка ошибки уникальности
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Вы уже оставили отзыв на этот товар' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Не удалось создать отзыв',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
