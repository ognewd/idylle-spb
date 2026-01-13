#!/bin/bash

# Полный скрипт деплоя на продакшн
# Выполняет все шаги: git pull, npm install, prisma, build, restart

set -e  # Выходим при первой ошибке

echo "🚀 Начало полного деплоя..."
echo "⏱️  Время начала: $(date)"

cd /root/idylle-spb || { echo "❌ Директория /root/idylle-spb не найдена!"; exit 1; }

# Шаг 1: Получить последние изменения
echo ""
echo "📥 Шаг 1: Получение изменений из Git..."
git fetch origin --prune
git reset --hard origin/main || git pull origin main
echo "✅ Код обновлен"

# Шаг 2: Установить зависимости
echo ""
echo "📦 Шаг 2: Установка зависимостей..."
npm ci --prefer-offline --no-audit
echo "✅ Зависимости установлены"

# Шаг 3: Настроить DATABASE_URL
echo ""
echo "🔧 Шаг 3: Настройка DATABASE_URL..."
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Проверяем, что DATABASE_URL указывает на локальный PostgreSQL
if echo "$DATABASE_URL" | grep -q "supabase\|aws-1-us-east-1"; then
    echo "⚠️  Предупреждение: DATABASE_URL указывает на Supabase, используем локальный fallback"
    export DATABASE_URL="postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public"
fi

echo "📊 DATABASE_URL настроен: ${DATABASE_URL%%@*}@***"

# Шаг 4: Применить миграции Prisma
echo ""
echo "🔄 Шаг 4: Применение миграций Prisma..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "🔄 Используем миграции..."
    npx prisma migrate deploy || npx prisma db push
else
    echo "🔄 Используем db push (миграций нет)..."
    npx prisma db push
fi

npx prisma generate
echo "✅ Prisma миграции применены"

# Шаг 5: Очистить старые файлы сборки
echo ""
echo "🧹 Шаг 5: Очистка старых файлов сборки..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Очистка завершена"

# Шаг 6: Собрать приложение
echo ""
echo "🔨 Шаг 6: Сборка приложения..."
echo "⏱️  Начало сборки: $(date)"
if ! npm run build; then
    echo "❌ Ошибка при сборке!"
    echo "📋 Проверяю логи..."
    pm2 logs idylle-spb --lines 20 --nostream || true
    exit 1
fi
echo "⏱️  Сборка завершена: $(date)"

# Проверить, что сборка успешна
if [ ! -f .next/BUILD_ID ]; then
    echo "❌ Ошибка: .next/BUILD_ID не найден после сборки!"
    exit 1
fi
echo "✅ Сборка успешна, BUILD_ID: $(cat .next/BUILD_ID)"

# Шаг 7: Перезапустить PM2
echo ""
echo "🔄 Шаг 7: Перезапуск приложения..."
if pm2 list | grep -q "idylle-spb"; then
    pm2 restart idylle-spb --update-env
else
    if [ -f ecosystem.config.js ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start npm --name "idylle-spb" -- start
    fi
fi
echo "✅ Приложение перезапущено"

# Шаг 8: Проверить статус
echo ""
echo "📊 Шаг 8: Проверка статуса..."
sleep 3
pm2 status

# Проверить логи на критические ошибки
echo ""
echo "📋 Проверка логов (последние 20 строк):"
pm2 logs idylle-spb --lines 20 --nostream || echo "⚠️  Не удалось получить логи"

# Проверить порт
echo ""
echo "🔍 Проверка порта 3000:"
if netstat -tlnp 2>/dev/null | grep -q ":3000" || ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "✅ Порт 3000 слушается"
else
    echo "⚠️  Порт 3000 не слушается"
fi

echo ""
echo "⏱️  Время завершения: $(date)"
echo "✅ Деплой завершен успешно!"
