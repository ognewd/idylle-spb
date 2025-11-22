import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function createMoreProducts() {
  try {
    await prisma.$connect();
    
    console.log('🛍️ Создаем больше продуктов...');
    
    // Получаем бренды и категории
    const brands = await prisma.brand.findMany();
    const categories = await prisma.category.findMany();
    
    console.log(`Доступные бренды: ${brands.length}`);
    console.log(`Доступные категории: ${categories.length}`);
    
    // Создаем продукты
    const products = [
      {
        id: 'prod_1',
        name: 'Dr. Vranjes - Firenze',
        slug: 'dr-vranjes-firenze',
        description: 'Элитный аромат для дома от итальянского бренда Dr. Vranjes. Создает атмосферу уюта и роскоши.',
        shortDescription: 'Итальянский аромат для дома',
        price: 15000,
        comparePrice: 18000,
        sku: 'DRV001',
        volume: '500 мл',
        gender: 'unisex',
        aromaFamily: 'древесный',
        ingredients: 'натуральные масла',
        isActive: true,
        isFeatured: true,
        stock: 10,
        brandId: 'brand_1',
        categoryId: 'cat_3' // Свечи
      },
      {
        id: 'prod_2',
        name: 'Jo Malone London - Lime Basil',
        slug: 'jo-malone-lime-basil',
        description: 'Классический аромат от британского бренда Jo Malone. Свежий и элегантный.',
        shortDescription: 'Британский аромат для дома',
        price: 12000,
        comparePrice: 15000,
        sku: 'JML001',
        volume: '200 мл',
        gender: 'unisex',
        aromaFamily: 'цитрусовый',
        ingredients: 'натуральные масла',
        isActive: true,
        isFeatured: false,
        stock: 15,
        brandId: 'brand_4',
        categoryId: 'cat_3' // Свечи
      },
      {
        id: 'prod_3',
        name: 'Mathilde M - Paris',
        slug: 'mathilde-m-paris',
        description: 'Французская свеча ручной работы. Создана с любовью в Париже.',
        shortDescription: 'Французская свеча',
        price: 8000,
        comparePrice: 10000,
        sku: 'MM001',
        volume: '200 гр',
        gender: 'unisex',
        aromaFamily: 'цветочный',
        ingredients: 'пчелиный воск',
        isActive: true,
        isFeatured: true,
        stock: 20,
        brandId: 'brand_3',
        categoryId: 'cat_3' // Свечи
      },
      {
        id: 'prod_4',
        name: 'Dr. Vranjes - Diffuser',
        slug: 'dr-vranjes-diffuser',
        description: 'Элегантный диффузор для создания атмосферы в доме.',
        shortDescription: 'Диффузор для дома',
        price: 9500,
        comparePrice: 12000,
        sku: 'DRV002',
        volume: '300 мл',
        gender: 'unisex',
        aromaFamily: 'древесный',
        ingredients: 'натуральные масла',
        isActive: true,
        isFeatured: false,
        stock: 8,
        brandId: 'brand_1',
        categoryId: 'cat_4' // Диффузоры
      },
      {
        id: 'prod_5',
        name: 'Jo Malone - Reed Diffuser',
        slug: 'jo-malone-reed-diffuser',
        description: 'Диффузор с тростниковыми палочками для равномерного распределения аромата.',
        shortDescription: 'Тростниковый диффузор',
        price: 11000,
        comparePrice: 14000,
        sku: 'JML002',
        volume: '165 мл',
        gender: 'unisex',
        aromaFamily: 'цветочный',
        ingredients: 'натуральные масла',
        isActive: true,
        isFeatured: true,
        stock: 12,
        brandId: 'brand_4',
        categoryId: 'cat_4' // Диффузоры
      }
    ];
    
    for (const productData of products) {
      try {
        // Проверяем, существует ли продукт
        const existingProduct = await prisma.product.findUnique({
          where: { id: productData.id }
        });
        
        if (existingProduct) {
          console.log(`⚠️ Продукт уже существует: ${productData.name}`);
          continue;
        }
        
        // Создаем продукт
        const product = await prisma.product.create({
          data: {
            id: productData.id,
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            shortDescription: productData.shortDescription,
            price: productData.price,
            comparePrice: productData.comparePrice,
            sku: productData.sku,
            volume: productData.volume,
            gender: productData.gender,
            aromaFamily: productData.aromaFamily,
            ingredients: productData.ingredients,
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
            stock: productData.stock,
            brandId: productData.brandId
          }
        });
        
        console.log(`✅ Продукт создан: ${product.name}`);
        
        // Создаем связь с категорией
        await prisma.productCategory.create({
          data: {
            productId: product.id,
            categoryId: productData.categoryId,
            isPrimary: true
          }
        });
        
        console.log(`✅ Связь с категорией создана: ${product.name} → категория ${productData.categoryId}`);
        
      } catch (error) {
        console.log(`❌ Ошибка создания продукта ${productData.name}:`, error);
      }
    }
    
    // Проверяем результат
    const productCount = await prisma.product.count();
    const productCategoryCount = await prisma.productCategory.count();
    
    console.log(`\n📊 Итоговая статистика:`);
    console.log(`🛍️ Продуктов: ${productCount}`);
    console.log(`🔗 Связей продуктов с категориями: ${productCategoryCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMoreProducts();
