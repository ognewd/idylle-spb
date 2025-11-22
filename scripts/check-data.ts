import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkData() {
  try {
    await prisma.$connect();
    
    const brands = await prisma.brand.findMany();
    console.log('🏷️ Бренды:');
    brands.forEach(b => console.log(`  - ${b.id}: ${b.name}`));
    
    const categories = await prisma.category.findMany();
    console.log('\n📂 Категории:');
    categories.forEach(c => console.log(`  - ${c.id}: ${c.name}`));
    
    const products = await prisma.product.findMany();
    console.log('\n🛍️ Продукты:');
    products.forEach(p => console.log(`  - ${p.id}: ${p.name} (brandId: ${p.brandId})`));
    
    const productCategories = await prisma.productCategory.findMany();
    console.log('\n🔗 Связи продуктов с категориями:');
    productCategories.forEach(pc => console.log(`  - ${pc.productId} → ${pc.categoryId}`));
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();


