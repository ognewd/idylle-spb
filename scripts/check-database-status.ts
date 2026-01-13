import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Проверяем состояние базы данных...\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.split('@')[0]}@***` : 'не установлен');
    
    await prisma.$connect();
    console.log('✅ Подключение к базе данных установлено\n');

    // Проверяем количество записей в основных таблицах
    const counts = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      categories: await prisma.category.count(),
      brands: await prisma.brand.count(),
      orders: await prisma.order.count(),
      addresses: await prisma.address.count(),
      seasonalDiscounts: await prisma.seasonalDiscount.count(),
      tasks: await prisma.task.count(),
      taskMessages: await prisma.taskMessage.count(),
    };

    console.log('📊 Текущее состояние базы данных:');
    console.log('   👥 Пользователи:', counts.users);
    console.log('   📦 Товары:', counts.products);
    console.log('   📁 Категории:', counts.categories);
    console.log('   🏷️  Бренды:', counts.brands);
    console.log('   🛒 Заказы:', counts.orders);
    console.log('   📍 Адреса:', counts.addresses);
    console.log('   💰 Скидки:', counts.seasonalDiscounts);
    console.log('   📋 Задачи:', counts.tasks);
    console.log('   💬 Сообщения в задачах:', counts.taskMessages);

    // Проверяем администраторов
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin'],
        },
      },
      select: {
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    console.log(`\n👨‍💼 Администраторы (${admins.length}):`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name || 'без имени'}) [${admin.role}] ${admin.isActive ? '✅' : '❌'}`);
    });

    // Проверяем последние записи для понимания временных меток
    const lastUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { email: true, createdAt: true },
    });

    if (lastUser) {
      console.log(`\n⏰ Последний пользователь создан: ${lastUser.createdAt.toLocaleString('ru-RU')}`);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();

