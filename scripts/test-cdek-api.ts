/**
 * Тестовый скрипт для проверки работы API СДЕК
 * Запуск: npx tsx scripts/test-cdek-api.ts
 */

import dotenv from 'dotenv';
import { config } from 'dotenv';

// Загружаем переменные окружения
config({ path: '.env.local' });

async function testCdekApi() {
  console.log('🧪 Тестирование API СДЕК...\n');

  // Проверка переменных окружения
  console.log('📋 Проверка переменных окружения:');
  console.log('  CDEK_CLIENT_ID:', process.env.CDEK_CLIENT_ID ? '✅ Установлен' : '❌ Не установлен');
  console.log('  CDEK_CLIENT_SECRET:', process.env.CDEK_CLIENT_SECRET ? '✅ Установлен' : '❌ Не установлен');
  console.log('  CDEK_TEST_MODE:', process.env.CDEK_TEST_MODE);
  console.log('  CDEK_API_TEST_URL:', process.env.CDEK_API_TEST_URL || 'https://api.edu.cdek.ru/v2');
  console.log('');

  // Динамический импорт модулей
  try {
    const { getCdekAccessToken } = await import('../src/lib/cdek/auth');
    const { calculateDelivery } = await import('../src/lib/cdek/calculator');
    const { getPvzByCity } = await import('../src/lib/cdek/pvz');

    // Тест 1: Авторизация
    console.log('🔐 Тест 1: Авторизация...');
    try {
      const token = await getCdekAccessToken();
      console.log('  ✅ Токен получен успешно!');
      console.log('  Длина токена:', token.length, 'символов');
      console.log('');
    } catch (error: any) {
      console.error('  ❌ Ошибка авторизации:', error.message);
      console.log('');
      return;
    }

    // Тест 2: Расчет стоимости
    console.log('💰 Тест 2: Расчет стоимости доставки (СПб → Москва, 1 кг)...');
    try {
      const calcResult = await calculateDelivery({
        fromCity: 'Санкт-Петербург',
        toCity: 'Москва',
        weight: 1000,
        length: 20,
        width: 15,
        height: 10,
      });
      
      console.log('  ✅ Расчет выполнен успешно!');
      console.log('  Найдено тарифов:', calcResult.tariffs?.length || 0);
      
      if (calcResult.tariffs && calcResult.tariffs.length > 0) {
        console.log('  Примеры тарифов:');
        calcResult.tariffs.slice(0, 3).forEach((tariff, index) => {
          console.log(`    ${index + 1}. ${tariff.tariff_name} (код: ${tariff.tariff_code})`);
          console.log(`       Стоимость: ${tariff.delivery_sum} ₽`);
          console.log(`       Срок: ${tariff.period_min}-${tariff.period_max} дн.`);
        });
      }
      console.log('');
    } catch (error: any) {
      console.error('  ❌ Ошибка расчета:', error.message);
      if (error.code) {
        console.error('  Код ошибки:', error.code);
      }
      console.log('');
    }

    // Тест 3: Получение ПВЗ
    console.log('📍 Тест 3: Получение списка ПВЗ в Москве...');
    try {
      const pvzList = await getPvzByCity('Москва');
      console.log('  ✅ Список ПВЗ получен!');
      console.log('  Найдено ПВЗ:', pvzList.length);
      
      if (pvzList.length > 0) {
        console.log('  Примеры ПВЗ:');
        pvzList.slice(0, 2).forEach((pvz, index) => {
          console.log(`    ${index + 1}. ${pvz.name} (код: ${pvz.code})`);
          console.log(`       Адрес: ${pvz.location?.address}`);
          if (pvz.location?.city) {
            console.log(`       Город: ${pvz.location.city}`);
          }
        });
      }
      console.log('');
    } catch (error: any) {
      console.error('  ❌ Ошибка получения ПВЗ:', error.message);
      if (error.code) {
        console.error('  Код ошибки:', error.code);
      }
      console.log('');
    }

    console.log('✅ Тестирование завершено!');
  } catch (error: any) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error(error);
  }
}

testCdekApi().catch(console.error);
