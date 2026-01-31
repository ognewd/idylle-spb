import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Проверяем текущее название категории...');
  
  // Сначала проверяем текущее состояние
  const currentCategory = await prisma.category.findFirst({
    where: { slug: 'podarki' },
  });
  
  console.log('Текущая категория:', currentCategory);
  
  if (!currentCategory) {
    console.log('Категория с slug "podarki" не найдена');
    return;
  }
  
  if (currentCategory.name === 'Подарки') {
    console.log('Название уже правильное: "Подарки"');
    return;
  }
  
  console.log(`Обновляем название с "${currentCategory.name}" на "Подарки"...`);
  
  const result = await prisma.$executeRaw`
    UPDATE categories 
    SET name = 'Подарки' 
    WHERE slug = 'podarki'
  `;

  console.log(`Обновлено строк: ${result}`);
  
  // Проверяем результат
  const updatedCategory = await prisma.category.findFirst({
    where: { slug: 'podarki' },
  });
  
  console.log('Результат после обновления:', updatedCategory);
}

main()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
