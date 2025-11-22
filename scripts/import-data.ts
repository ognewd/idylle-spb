import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Функция для парсинга CSV
function parseCSV(content: string) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Убираем кавычки если есть
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      // Конвертируем значения
      if (value === 'true') obj[header] = true;
      else if (value === 'false') obj[header] = false;
      else if (value === 'null' || value === '') obj[header] = null;
      else if (!isNaN(Number(value)) && value !== '') obj[header] = Number(value);
      else obj[header] = value;
    });
    return obj;
  });
}

async function importData() {
  console.log('📦 Начинаем импорт данных...');
  
  try {
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!');

    // 1. Импорт брендов
    console.log('\n🏷️ Импорт брендов...');
    const brandsPath = path.resolve(__dirname, '../data/brands-correct.csv');
    if (fs.existsSync(brandsPath)) {
      const brandsContent = fs.readFileSync(brandsPath, 'utf-8');
      const brands = parseCSV(brandsContent);
      
      for (const brand of brands) {
        try {
          await prisma.brand.create({
            data: {
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              description: brand.description,
              logo: brand.logo,
              website: brand.website,
              isActive: brand.isActive,
              createdAt: new Date(brand.createdAt),
              updatedAt: new Date(brand.updatedAt)
            }
          });
          console.log(`✅ Бренд создан: ${brand.name}`);
        } catch (error) {
          console.log(`⚠️ Бренд уже существует: ${brand.name}`);
        }
      }
    } else {
      console.log('⚠️ Файл brands-correct.csv не найден');
    }

    // 2. Импорт категорий
    console.log('\n📂 Импорт категорий...');
    const categoriesPath = path.resolve(__dirname, '../data/categories.csv');
    if (fs.existsSync(categoriesPath)) {
      const categoriesContent = fs.readFileSync(categoriesPath, 'utf-8');
      const categories = parseCSV(categoriesContent);
      
      for (const category of categories) {
        try {
          await prisma.category.create({
            data: {
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              parentId: category.parentId,
              image: category.image,
              sortOrder: category.sortOrder || 0,
              isActive: category.isActive,
              createdAt: new Date(category.createdAt),
              updatedAt: new Date(category.updatedAt)
            }
          });
          console.log(`✅ Категория создана: ${category.name}`);
        } catch (error) {
          console.log(`⚠️ Категория уже существует: ${category.name}`);
        }
      }
    } else {
      console.log('⚠️ Файл categories.csv не найден');
    }

    // 3. Импорт пользователей
    console.log('\n👥 Импорт пользователей...');
    const usersPath = path.resolve(__dirname, '../data/users.csv');
    if (fs.existsSync(usersPath)) {
      const usersContent = fs.readFileSync(usersPath, 'utf-8');
      const users = parseCSV(usersContent);
      
      for (const user of users) {
        try {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email,
              name: user.name,
              phone: user.phone,
              password: user.password,
              role: user.role,
              isActive: user.isActive,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
              termsAcceptedAt: user.termsAcceptedAt ? new Date(user.termsAcceptedAt) : null,
              privacyAcceptedAt: user.privacyAcceptedAt ? new Date(user.privacyAcceptedAt) : null
            }
          });
          console.log(`✅ Пользователь создан: ${user.email}`);
        } catch (error) {
          console.log(`⚠️ Пользователь уже существует: ${user.email}`);
        }
      }
    } else {
      console.log('⚠️ Файл users.csv не найден');
    }

    // 4. Импорт продуктов
    console.log('\n🛍️ Импорт продуктов...');
    const productsPath = path.resolve(__dirname, '../data/products-correct.csv');
    if (fs.existsSync(productsPath)) {
      const productsContent = fs.readFileSync(productsPath, 'utf-8');
      const products = parseCSV(productsContent);
      
      for (const product of products) {
        try {
          await prisma.product.create({
            data: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description,
              shortDescription: product.shortDescription,
              price: product.price,
              comparePrice: product.comparePrice,
              sku: product.sku,
              volume: product.volume,
              gender: product.gender,
              aromaFamily: product.aromaFamily,
              ingredients: product.ingredients,
              isActive: product.isActive,
              isFeatured: product.isFeatured || false,
              stock: product.stock || 0,
              weight: product.weight,
              dimensions: product.dimensions,
              createdAt: new Date(product.createdAt),
              updatedAt: new Date(product.updatedAt),
              brandId: product.brandId
            }
          });
          console.log(`✅ Продукт создан: ${product.name}`);
        } catch (error) {
          console.log(`⚠️ Продукт уже существует: ${product.name}`);
        }
      }
    } else {
      console.log('⚠️ Файл products.csv не найден');
    }

    // 5. Импорт связей продуктов с категориями
    console.log('\n🔗 Импорт связей продуктов с категориями...');
    const productCategoriesPath = path.resolve(__dirname, '../data/product-categories-correct.csv');
    if (fs.existsSync(productCategoriesPath)) {
      const productCategoriesContent = fs.readFileSync(productCategoriesPath, 'utf-8');
      const productCategories = parseCSV(productCategoriesContent);
      
      for (const pc of productCategories) {
        try {
          await prisma.productCategory.create({
            data: {
              id: pc.id,
              productId: pc.productId,
              categoryId: pc.categoryId,
              isPrimary: pc.isPrimary || false
            }
          });
          console.log(`✅ Связь создана: продукт ${pc.productId} → категория ${pc.categoryId}`);
        } catch (error) {
          console.log(`⚠️ Связь уже существует: продукт ${pc.productId} → категория ${pc.categoryId}`);
        }
      }
    } else {
      console.log('⚠️ Файл product-categories.csv не найден');
    }

    console.log('\n🎉 Импорт данных завершен успешно!');

    // Показываем статистику
    const brandCount = await prisma.brand.count();
    const categoryCount = await prisma.category.count();
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const productCategoryCount = await prisma.productCategory.count();

    console.log('\n📊 Статистика:');
    console.log(`🏷️ Брендов: ${brandCount}`);
    console.log(`📂 Категорий: ${categoryCount}`);
    console.log(`👥 Пользователей: ${userCount}`);
    console.log(`🛍️ Продуктов: ${productCount}`);
    console.log(`🔗 Связей продуктов с категориями: ${productCategoryCount}`);

  } catch (error) {
    console.error('❌ Ошибка при импорте данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
