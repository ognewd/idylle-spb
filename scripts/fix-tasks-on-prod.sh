#!/bin/bash

# Скрипт для применения миграции Task модели на продакшене

set -e

echo "🔧 Исправление таблиц tasks на продакшене..."

cd /root/idylle-spb

# Загружаем переменные окружения из .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Проверяем DATABASE_URL
echo "📊 Проверка DATABASE_URL..."
if echo "$DATABASE_URL" | grep -q "supabase\|aws-1-us-east-1"; then
    echo "❌ ОШИБКА: DATABASE_URL указывает на Supabase!"
    echo "Нужно использовать локальный PostgreSQL: postgresql://idylle_user:...@localhost:5432/idylle_spb"
    echo ""
    echo "Текущий DATABASE_URL: ${DATABASE_URL%%@*}@***"
    exit 1
fi

# Используем DATABASE_URL из .env или fallback
DB_URL="${DATABASE_URL:-postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public}"

echo "📊 Используется DATABASE_URL: ${DB_URL%%@*}@***"

echo "🔄 Применяю миграцию Prisma..."
export DATABASE_URL="$DB_URL"
npx prisma db push --accept-data-loss

echo "🔄 Генерирую Prisma Client..."
npx prisma generate

echo "🔍 Проверяю, что таблица tasks создана..."
if psql "$DB_URL" -c "\d tasks" > /dev/null 2>&1; then
    echo "✅ Таблица tasks существует"
    psql "$DB_URL" -c "SELECT COUNT(*) as task_count FROM tasks;"
else
    echo "❌ Таблица tasks не найдена!"
    exit 1
fi

echo "🔄 Перезапускаю приложение..."
pm2 restart idylle-spb --update-env

echo "📊 Статус PM2:"
pm2 status

echo "✅ Готово! Таблицы tasks и task_messages должны быть созданы."
echo "Проверьте страницу /admin/tasks"

