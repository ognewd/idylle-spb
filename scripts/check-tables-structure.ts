import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkTablesStructure() {
  console.log('🔍 Проверяем структуру таблиц...');
  try {
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!');

    // Проверяем структуру таблицы Brand
    console.log('\n📋 Структура таблицы Brand:');
    const brandColumns = await prisma.$queryRaw<{ column_name: string; data_type: string; is_nullable: string }[]>`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Brand' 
      ORDER BY ordinal_position;
    `;
    console.log(brandColumns);

    // Проверяем структуру таблицы Product
    console.log('\n📋 Структура таблицы Product:');
    const productColumns = await prisma.$queryRaw<{ column_name: string; data_type: string; is_nullable: string }[]>`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Product' 
      ORDER BY ordinal_position;
    `;
    console.log(productColumns);

    // Проверяем внешние ключи
    console.log('\n🔗 Внешние ключи:');
    const foreignKeys = await prisma.$queryRaw<{ constraint_name: string; table_name: string; column_name: string; foreign_table_name: string; foreign_column_name: string }[]>`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name;
    `;
    console.log(foreignKeys);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTablesStructure();
