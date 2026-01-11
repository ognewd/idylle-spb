#!/bin/bash

# Скрипт для исправления проблемы с таблицей pages на продакшене

set -e

echo "🔍 Проверка текущего состояния..."

cd /root/idylle-spb

# Проверяем, существует ли таблица pages
TABLE_EXISTS=$(psql $DATABASE_URL -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pages');" | tr -d ' ')

if [ "$TABLE_EXISTS" = "t" ]; then
    echo "✅ Таблица pages уже существует"
else
    echo "❌ Таблица pages не существует, применяю миграцию..."
    npx prisma db push --accept-data-loss
fi

echo "🔄 Генерирую Prisma Client..."
npx prisma generate

echo "📄 Создаю страницы по умолчанию..."
npx tsx scripts/seed-pages.ts || echo "⚠️  Предупреждение: некоторые страницы могли уже существовать"

echo "🔄 Перезапускаю приложение..."
pm2 restart idylle-spb

echo "✅ Готово! Проверьте страницу /admin/pages"

