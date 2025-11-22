#!/usr/bin/env node

/**
 * Скрипт для настройки базы данных на Vercel
 * Запускает сборку и деплой с правильными переменными окружения
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Настройка базы данных для Vercel...');

try {
  // Проверяем наличие DATABASE_URL
  const envPath = '.env.local';
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  if (!envContent.includes('DATABASE_URL')) {
    console.log('⚠️  DATABASE_URL не найден в .env.local');
    console.log('📝 Добавьте DATABASE_URL в .env.local или в Environment Variables Vercel');
    console.log('');
    console.log('Пример:');
    console.log('DATABASE_URL="postgresql://username:password@host:port/database"');
    console.log('');
  }
  
  console.log('✅ Проверка завершена');
  console.log('');
  console.log('📋 Следующие шаги:');
  console.log('1. Создайте Vercel Postgres базу данных');
  console.log('2. Добавьте DATABASE_URL в Environment Variables');
  console.log('3. Запустите: vercel --prod');
  console.log('');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
}


