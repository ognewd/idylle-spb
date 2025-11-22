import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Buyer {
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string | null;
  firstOrderDate: Date;
  lastOrderDate: Date;
  totalOrders: number;
  isRegistered: boolean;
}

// Получить список всех покупателей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all'; // 'all', 'registered', 'unregistered'

    // Получаем всех зарегистрированных пользователей
    const allUsers = await prisma.user.findMany({
      where: {
        role: { not: 'admin' },
        AND: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        } : undefined,
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

    // Создаем Map для покупателей
    const buyersMap = new Map<string, Buyer>();

    // Добавляем всех зарегистрированных пользователей
    allUsers.forEach(user => {
      const email = user.email.toLowerCase();
      if (!buyersMap.has(email)) {
        buyersMap.set(email, {
          userId: user.id,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: user.phone || '',
          city: null,
          firstOrderDate: user.createdAt,
          lastOrderDate: user.createdAt,
          totalOrders: 0,
          isRegistered: true,
        });
      }
    });

    // Получаем заказы с информацией о пользователе
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        createdAt: true,
        userId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Обновляем информацию о заказах
    orders.forEach(order => {
      const email = order.email.toLowerCase();
      if (!buyersMap.has(email)) {
        // Гость без зарегистрированного аккаунта
        buyersMap.set(email, {
          userId: order.userId,
          firstName: order.firstName,
          lastName: order.lastName,
          email: order.email,
          phone: order.phone,
          city: order.city,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
          totalOrders: 1,
          isRegistered: !!order.userId,
        });
      } else {
        // Обновляем существующего покупателя
        const buyer = buyersMap.get(email);
        if (buyer) {
          buyer.totalOrders += 1;
          if (order.createdAt > buyer.lastOrderDate) {
            buyer.lastOrderDate = order.createdAt;
          }
          if (order.createdAt < buyer.firstOrderDate) {
            buyer.firstOrderDate = order.createdAt;
          }
          // Обновляем контакты, если они есть в заказе
          if (order.phone) buyer.phone = order.phone;
          if (order.city) buyer.city = order.city;
        }
      }
    });

    // Конвертируем Map в массив
    let buyers = Array.from(buyersMap.values());

    // Фильтрация по статусу регистрации
    if (filter === 'registered') {
      buyers = buyers.filter(buyer => buyer.isRegistered);
    } else if (filter === 'unregistered') {
      buyers = buyers.filter(buyer => !buyer.isRegistered);
    }

    // Сортировка
    buyers.sort((a, b) => 
      new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBuyers = buyers.slice(startIndex, endIndex);

    // Получаем общую сумму заказов для каждого покупателя
    const buyersWithTotals = await Promise.all(
      paginatedBuyers.map(async (buyer) => {
        const orders = await prisma.order.findMany({
          where: { email: buyer.email },
          select: { total: true },
        });
        
        const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
        
        return {
          ...buyer,
          totalSpent,
        };
      })
    );

    return NextResponse.json({
      success: true,
      buyers: buyersWithTotals,
      pagination: {
        page,
        limit,
        total: buyers.length,
        totalPages: Math.ceil(buyers.length / limit),
      },
    });
  } catch (error) {
    console.error('Ошибка при получении списка покупателей:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении списка покупателей' },
      { status: 500 }
    );
  }
}

