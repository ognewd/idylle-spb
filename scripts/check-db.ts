#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Проверяем подключение к базе данных...');
    
    // Проверяем подключение
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!');
    
    // Проверяем существующие таблицы
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('📋 Существующие таблицы:');
    console.log(result);
    
    // Проверяем количество записей в каждой таблице
    const tables = result as Array<{ table_name: string }>;
    
    for (const table of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
        console.log(`📊 ${table.table_name}: ${(count as any)[0].count} записей`);
      } catch (error) {
        console.log(`❌ Ошибка при подсчете записей в ${table.table_name}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();


