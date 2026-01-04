import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIndexes() {
  try {
    console.log('🔍 Проверяю индексы в базе данных...\n');

    // Проверяем индексы на таблице products
    const result = await prisma.$queryRaw<Array<{
      tablename: string;
      indexname: string;
      indexdef: string;
    }>>`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'products'
      ORDER BY indexname;
    `;

    console.log(`📊 Найдено индексов на таблице 'products': ${result.length}\n`);

    if (result.length === 0) {
      console.log('⚠️  Индексы не найдены! Возможно, нужно применить миграции.\n');
      console.log('💡 Выполните: npx prisma db push\n');
      return;
    }

    console.log('✅ Найденные индексы:\n');
    
    const expectedIndexes = [
      'products_slug_key', // unique constraint
      'products_myWarehouseCode_key', // unique constraint
      'products_sku_key', // unique constraint
      'products_myWarehouseCode_idx', // index
      'products_slug_idx', // index
      'products_isActive_idx', // index
      'products_brandId_idx', // index
      'products_price_idx', // index
    ];

    for (const index of result) {
      const isExpected = expectedIndexes.some(expected => 
        index.indexname.includes(expected.replace('products_', '').replace('_key', '').replace('_idx', ''))
      );
      
      const status = isExpected ? '✅' : 'ℹ️ ';
      console.log(`${status} ${index.indexname}`);
      console.log(`   ${index.indexdef}\n`);
    }

    // Проверяем наличие конкретных индексов
    const indexNames = result.map(r => r.indexname);
    const foundIndexes = {
      slug: indexNames.some(name => name.includes('slug')),
      isActive: indexNames.some(name => name.includes('isActive')),
      brandId: indexNames.some(name => name.includes('brandId')),
      price: indexNames.some(name => name.includes('price')),
      myWarehouseCode: indexNames.some(name => name.includes('myWarehouseCode')),
    };

    console.log('\n📋 Статус индексов:');
    console.log(`   ${foundIndexes.slug ? '✅' : '❌'} slug`);
    console.log(`   ${foundIndexes.isActive ? '✅' : '❌'} isActive`);
    console.log(`   ${foundIndexes.brandId ? '✅' : '❌'} brandId`);
    console.log(`   ${foundIndexes.price ? '✅' : '❌'} price`);
    console.log(`   ${foundIndexes.myWarehouseCode ? '✅' : '❌'} myWarehouseCode`);

    const allIndexed = Object.values(foundIndexes).every(v => v);
    if (allIndexed) {
      console.log('\n✅ Все необходимые индексы применены!');
    } else {
      console.log('\n⚠️  Некоторые индексы отсутствуют. Примените схему:');
      console.log('   npx prisma db push');
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке индексов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIndexes();

