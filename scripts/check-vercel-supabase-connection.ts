/**
 * Скрипт для проверки подключения Vercel к Supabase
 * Запуск: npx tsx scripts/check-vercel-supabase-connection.ts
 */

async function checkVercelSupabaseConnection() {
  console.log('🔍 Проверяю подключение Vercel к Supabase...\n');

  const baseUrl = 'https://idylle-spb.vercel.app';

  try {
    // 1. Проверка Health Check
    console.log('1️⃣ Проверяю Health Check API...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();

    console.log('   ✅ Health Check статус:', healthResponse.status);
    console.log('   📊 Данные из БД:');
    console.log('      - Товаров:', healthData.database?.products || healthData.products || 0);
    console.log('      - Категорий:', healthData.database?.categories || healthData.categories || 0);
    console.log('      - Брендов:', healthData.database?.brands || healthData.brands || 0);
    console.log('   🔗 Подключение к БД:', healthData.checks?.database || 'не указано');

    const productCount = healthData.database?.products || healthData.products || 0;
    
    if (productCount === 0) {
      console.log('\n   ⚠️  ВНИМАНИЕ: 0 товаров в production БД!');
      console.log('   Это означает, что Vercel НЕ подключен к Supabase (1048 товаров)');
    } else if (productCount === 1048) {
      console.log('\n   ✅ УСПЕХ: Vercel подключен к Supabase!');
      console.log('   Количество товаров совпадает с Supabase БД (1048)');
    } else {
      console.log(`\n   ⚠️  Неожиданное количество товаров: ${productCount}`);
      console.log('   Ожидалось: 1048 (Supabase)');
    }

    // 2. Проверка Products API
    console.log('\n2️⃣ Проверяю Products API...');
    const productsResponse = await fetch(`${baseUrl}/api/products?limit=1`);
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log('   ✅ Products API работает');
      console.log('   📦 Получено товаров:', productsData.products?.length || 0);
      
      if (productsData.products && productsData.products.length > 0) {
        console.log('   📝 Первый товар:', productsData.products[0].name?.substring(0, 50) || 'N/A');
      }
    } else {
      const errorText = await productsResponse.text();
      console.log('   ❌ Products API ошибка:', productsResponse.status);
      console.log('   📄 Ответ:', errorText.substring(0, 200));
    }

    // 3. Проверка Categories API
    console.log('\n3️⃣ Проверяю Categories API...');
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('   ✅ Categories API работает');
      console.log('   📂 Категорий:', categoriesData.categories?.length || 0);
      
      if (categoriesData.categories && categoriesData.categories.length > 0) {
        console.log('   📝 Категории:', categoriesData.categories.map((c: any) => c.name).join(', '));
      }
    } else {
      console.log('   ❌ Categories API ошибка:', categoriesResponse.status);
    }

    // 4. Итоговый вывод
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВЫЙ РЕЗУЛЬТАТ:');
    console.log('='.repeat(60));
    
    if (productCount === 1048) {
      console.log('✅ Vercel ПОДКЛЮЧЕН к Supabase');
      console.log('✅ DATABASE_URL настроен правильно');
    } else if (productCount === 0) {
      console.log('❌ Vercel НЕ подключен к Supabase');
      console.log('❌ DATABASE_URL неверный или не настроен');
      console.log('\n🔧 РЕШЕНИЕ: Обновите DATABASE_URL в Vercel Dashboard');
      console.log('   См. инструкцию: UPDATE_VERCEL_DATABASE_URL.md');
    } else {
      console.log('⚠️  Неопределенное состояние подключения');
      console.log(`   Товаров в production: ${productCount}`);
      console.log('   Ожидалось: 1048 (Supabase)');
    }

  } catch (error: any) {
    console.error('\n❌ Ошибка при проверке:', error.message);
    console.error('   Детали:', error);
  }
}

checkVercelSupabaseConnection();

