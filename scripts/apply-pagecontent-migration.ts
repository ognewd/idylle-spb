import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('📝 Применяем миграцию для добавления поля pageContent...\n');

    // Проверяем, существует ли поле через прямой SQL запрос
    const checkColumn = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      AND column_name = 'pageContent'
    `;

    if (checkColumn.length > 0) {
      console.log('✅ Поле pageContent уже существует в таблице categories');
      return;
    }

    // Добавляем поле через SQL
    console.log('🔄 Добавляем поле pageContent в таблицу categories...');
    await prisma.$executeRaw`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS "pageContent" TEXT
    `;

    console.log('✅ Поле pageContent успешно добавлено!');
    
    // Проверяем результат
    const verify = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      AND column_name = 'pageContent'
    `;

    if (verify.length > 0) {
      console.log('✅ Проверка пройдена: поле pageContent существует');
    } else {
      console.log('⚠️  Предупреждение: не удалось подтвердить создание поля');
    }

  } catch (error) {
    console.error('❌ Ошибка при применении миграции:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

