#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function checkConnection() {
  try {
    console.log('🔍 Проверяем подключение к базе данных...');
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ DATABASE_URL не установлен в переменных окружения');
      return;
    }
    
    // Mask password in URL for display
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
    console.log('📋 DATABASE_URL:', maskedUrl);
    
    console.log('⏳ Подключаемся к базе данных...');
    await prisma.$connect();
    console.log('✅ Подключение успешно!');
    
    console.log('📊 Проверяем данные...');
    const userCount = await prisma.user.count();
    console.log(`✅ Количество пользователей: ${userCount}`);
    
    const productCount = await prisma.product.count();
    console.log(`✅ Количество продуктов: ${productCount}`);
    
    const brandCount = await prisma.brand.count();
    console.log(`✅ Количество брендов: ${brandCount}`);
    
    // Try to find first admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: { in: ['admin', 'super_admin'] },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    
    if (adminUser) {
      console.log(`✅ Админ пользователь найден: ${adminUser.email} (${adminUser.role})`);
    } else {
      console.log('⚠️ Админ пользователь не найден');
    }
    
    console.log('\n✅ Все проверки пройдены успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка подключения:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('\n📋 Детали ошибки:');
      console.error('Сообщение:', error.message);
      console.error('Стек:', error.stack);
      
      if (error.message.includes('Tenant or user not found') || error.message.includes('Connection')) {
        console.error('\n💡 Возможная причина: Неправильный DATABASE_URL или БД недоступна');
        console.error('   Проверьте: формат postgresql://user:password@host:port/database и доступность хоста');
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Соединение закрыто');
  }
}

checkConnection();

