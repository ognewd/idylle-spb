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

async function importProducts() {
  try {
    await prisma.$connect();
    
    console.log('🛍️ Импорт продуктов...');
    
    // Проверяем бренды
    const brands = await prisma.brand.findMany();
    console.log('Доступные бренды:', brands.map(b => ({ id: b.id, name: b.name })));
    
    const productsPath = path.resolve(__dirname, '../data/products-correct.csv');
    if (fs.existsSync(productsPath)) {
      const productsContent = fs.readFileSync(productsPath, 'utf-8');
      console.log('Содержимое CSV файла:');
      console.log(productsContent);
      
      const products = parseCSV(productsContent);
      console.log('Распарсенные продукты:');
      console.log(products);
      
      for (const product of products) {
        console.log(`Создаем продукт: ${product.name}, brandId: ${product.brandId}`);
        
        try {
          const createdProduct = await prisma.product.create({
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
              // weight: product.weight ? parseFloat(product.weight) : null,
              dimensions: product.dimensions,
              createdAt: new Date(product.createdAt),
              updatedAt: new Date(product.updatedAt),
              brandId: product.brandId
            }
          });
          console.log(`✅ Продукт создан: ${createdProduct.name}`);
        } catch (error) {
          console.error(`❌ Ошибка создания продукта ${product.name}:`, error);
        }
      }
    } else {
      console.log('⚠️ Файл products-correct.csv не найден');
    }
    
    // Проверяем результат
    const productCount = await prisma.product.count();
    console.log(`\n📊 Всего продуктов: ${productCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProducts();
