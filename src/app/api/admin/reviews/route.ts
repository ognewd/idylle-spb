import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Проверка авторизации админа
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'admin' || payload.role === 'super_admin') {
      return payload;
    }
  } catch (error) {
    return null;
  }
  return null;
}

/**
 * GET /api/admin/reviews
 * Получить список отзывов для модерации
 */
export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'pending', 'approved', 'all'
    const type = searchParams.get('type') || 'product'; // 'product' or 'company' (пока только product)

    // Фильтры
    const where: any = {};
    
    // Для отзывов на товар productId всегда должен быть не null
    // В текущей схеме все отзывы связаны с продуктом, так что этот фильтр не обязателен
    // Но оставим для будущей поддержки отзывов на компанию
    
    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }
    // Если status === 'all' или не указан, показываем все

    // Загружаем отзывы с продуктами
    // user может быть null для анонимных отзывов, поэтому используем опциональный include
    const reviews = await prisma.review.findMany({
      where,
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
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Форматируем ответ, добавляя userName и userEmail для анонимных отзывов
    const formattedReviews = reviews.map(review => ({
      ...review,
      // Для фронтенда: если user null, используем userName/userEmail
      userName: review.userName || review.user?.name || null,
      userEmail: review.userEmail || review.user?.email || null,
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { 
        error: 'Не удалось загрузить отзывы',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reviews
 * Обновить статус отзыва (одобрить/отклонить)
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewId, isApproved } = body;

    if (!reviewId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'Необходимо указать reviewId и isApproved' },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
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
      message: isApproved ? 'Отзыв одобрен' : 'Отзыв отклонен',
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить отзыв' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews
 * Удалить отзыв
 */
export async function DELETE(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Необходимо указать reviewId' },
        { status: 400 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: 'Отзыв удален',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить отзыв' },
      { status: 500 }
    );
  }
}
