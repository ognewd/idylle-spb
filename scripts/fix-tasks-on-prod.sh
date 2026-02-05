#!/bin/bash

# Скрипт для применения миграции Task модели на продакшене

set -e

echo "🔧 Исправление таблиц tasks на продакшене..."

cd /root/idylle-spb

# Загружаем переменные окружения из .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "📊 Проверка DATABASE_URL..."
DB_URL="${DATABASE_URL:-}"
if [ -z "$DB_URL" ]; then
  echo "❌ Задайте DATABASE_URL в .env"
  exit 1
fi
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

