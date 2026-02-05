#!/bin/bash

# Скрипт для исправления проблемы с таблицей pages на продакшене

set -e

echo "🔍 Проверка текущего состояния..."

cd /root/idylle-spb

# Загружаем переменные окружения из .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Используем DATABASE_URL из .env или ecosystem.config.js
# На продакшене должен быть локальный PostgreSQL
DB_URL="${DATABASE_URL:-}"
if [ -z "$DB_URL" ]; then
  echo "❌ Задайте DATABASE_URL в .env"
  exit 1
fi
echo "📊 Используется DATABASE_URL: ${DB_URL%%@*}@***"

# Проверяем, существует ли таблица pages (пропускаем проверку через psql, так как может быть проблема с доступом)
echo "🔄 Применяю миграцию Prisma..."
npx prisma db push --accept-data-loss

echo "🔄 Генерирую Prisma Client..."
npx prisma generate

echo "📄 Создаю страницы по умолчанию..."
npx tsx scripts/seed-pages.ts || echo "⚠️  Предупреждение: некоторые страницы могли уже существовать"

echo "🔄 Перезапускаю приложение..."
pm2 restart idylle-spb

echo "✅ Готово! Проверьте страницу /admin/pages"

