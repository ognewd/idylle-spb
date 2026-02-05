#!/bin/bash

# Скрипт для исправления проблемы с таблицей task_messages на продакшене

set -e

echo "🔍 Проверка текущего состояния..."

cd /root/idylle-spb

# Используем DATABASE_URL из .env или локальный PostgreSQL
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
DB_URL="${DATABASE_URL:-}"
if [ -z "$DB_URL" ]; then
  echo "❌ Задайте DATABASE_URL в .env или в окружении"
  exit 1
fi
echo "📊 Используется DATABASE_URL: ${DB_URL%%@*}@***"

# Сначала добавляем колонки через SQL, если их нет
echo "🔧 Добавляю колонки через SQL (если их нет)..."
# psql не поддерживает ?schema= в URI, используем отдельные параметры
psql -h localhost -p 5432 -U idylle_user -d idylle_spb <<EOF
-- Добавляем updatedAt с default значением
ALTER TABLE task_messages ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Обновляем существующие записи
UPDATE task_messages SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Добавляем fileUrl и fileName, если их нет
ALTER TABLE task_messages ADD COLUMN IF NOT EXISTS "fileUrl" TEXT;
ALTER TABLE task_messages ADD COLUMN IF NOT EXISTS "fileName" TEXT;

-- Делаем message nullable
ALTER TABLE task_messages ALTER COLUMN "message" DROP NOT NULL;
EOF

# Применяю миграцию Prisma
echo "🔄 Применяю миграцию Prisma..."
export DATABASE_URL="$DB_URL"
npx prisma db push --accept-data-loss

echo "🔄 Генерирую Prisma Client..."
npx prisma generate

echo "🔄 Перезапускаю приложение..."
pm2 restart idylle-spb --update-env

echo "✅ Готово! Проверьте страницу /admin/tasks"

