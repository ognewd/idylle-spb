#!/bin/bash

# Скрипт для исправления проблемы с таблицей task_messages на продакшене

set -e

echo "🔍 Проверка текущего состояния..."

cd /root/idylle-spb

# ПРИНУДИТЕЛЬНО используем локальный PostgreSQL
# Игнорируем DATABASE_URL из .env, если он указывает на Supabase
DB_URL="postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public"

echo "📊 Используется DATABASE_URL: ${DB_URL%%@*}@***"

# Применяю миграцию Prisma
echo "🔄 Применяю миграцию Prisma..."
export DATABASE_URL="$DB_URL"
npx prisma db push --accept-data-loss

echo "🔄 Генерирую Prisma Client..."
npx prisma generate

echo "🔄 Перезапускаю приложение..."
pm2 restart idylle-spb --update-env

echo "✅ Готово! Проверьте страницу /admin/tasks"

