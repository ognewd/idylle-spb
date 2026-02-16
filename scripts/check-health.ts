#!/usr/bin/env tsx

/**
 * Скрипт для проверки здоровья приложения
 * Использование: npx tsx scripts/check-health.ts [url]
 */

const HEALTH_CHECK_URL = process.argv[2] || 'http://localhost:3000/api/health';

async function checkHealth() {
  try {
    console.log(`🔍 Проверяем health check: ${HEALTH_CHECK_URL}\n`);

    const response = await fetch(HEALTH_CHECK_URL);
    const data = await response.json();

    console.log('📊 Результат проверки:');
    console.log('─'.repeat(50));
    console.log(`Статус: ${data.status === 'ok' ? '✅ OK' : '❌ ERROR'}`);
    console.log(`Время: ${data.timestamp}`);
    console.log(`Окружение: ${data.environment}`);
    console.log(`Uptime: ${Math.floor(data.uptime / 60)} мин ${Math.floor(data.uptime % 60)} сек`);
    
    if (data.checks) {
      console.log('\n🔧 Проверки:');
      console.log(`  API: ${data.checks.api === 'ok' ? '✅' : '❌'} ${data.checks.api}`);
      console.log(`  База данных: ${data.checks.database === 'connected' ? '✅' : '❌'} ${data.checks.database}`);
    }

    if (data.database) {
      console.log('\n📦 База данных:');
      console.log(`  Всего товаров: ${data.database.products}`);
      if (data.database.activeProducts !== undefined) {
        console.log(`  Активных товаров: ${data.database.activeProducts}`);
        if (data.database.activeProducts === 0 && data.database.products > 0) {
          console.log(`  ⚠️  ВНИМАНИЕ: Все товары неактивны!`);
        }
      }
      console.log(`  Категорий: ${data.database.categories}`);
      console.log(`  Брендов: ${data.database.brands}`);
    }

    if (data.error) {
      console.log(`\n❌ Ошибка: ${data.error}`);
    }

    console.log('─'.repeat(50));
    console.log(`HTTP статус: ${response.status} ${response.status === 200 ? '✅' : '❌'}`);

    process.exit(response.status === 200 ? 0 : 1);
  } catch (error) {
    console.error('❌ Ошибка при проверке health check:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkHealth();

