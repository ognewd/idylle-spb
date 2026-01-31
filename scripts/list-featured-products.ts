/**
 * Список товаров с флагом «Рекомендуемый» (isFeatured) — они показываются в слайдере и блоке «Рекомендуем вам» на главной.
 * Запуск: npx tsx scripts/list-featured-products.ts
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    select: { id: true, name: true, slug: true, price: true },
    orderBy: [{ createdAt: 'desc' }],
  });

  console.log('Избранные товары (isFeatured = true):\n');
  if (products.length === 0) {
    console.log('  Нет товаров. Включите «Рекомендуемый товар» в карточке товара в админке.');
    return;
  }
  products.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}`);
    console.log(`     slug: ${p.slug}  |  ${Number(p.price).toLocaleString('ru-RU')} ₽`);
  });
  console.log(`\nВсего: ${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
