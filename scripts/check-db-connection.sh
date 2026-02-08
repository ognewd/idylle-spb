#!/bin/bash

# Скрипт для проверки подключения к базе данных
# Использование: bash scripts/check-db-connection.sh

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

echo "🔍 Проверка подключения к базе данных..."
echo ""

# 1. Проверяем .env файл
echo "1️⃣  Проверка .env файла:"
if [ -f .env ]; then
    echo "  ✅ .env файл найден"
    if grep -q "^DATABASE_URL=" .env; then
        DB_URL=$(grep "^DATABASE_URL=" .env | head -1 | cut -d'=' -f2-)
        DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        echo "  ✅ DATABASE_URL найден"
        echo "  📊 Host: ${DB_HOST:-не определен}"
        echo "  📊 Port: ${DB_PORT:-не определен}"
    else
        echo "  ❌ DATABASE_URL не найден в .env"
    fi
else
    echo "  ❌ .env файл не найден!"
fi

echo ""

# 2. Проверяем ecosystem.config.cjs
echo "2️⃣  Проверка ecosystem.config.cjs:"
if [ -f ecosystem.config.cjs ]; then
    echo "  ✅ ecosystem.config.cjs найден"
    if grep -q "DATABASE_URL:" ecosystem.config.cjs; then
        echo "  ✅ DATABASE_URL найден в ecosystem.config.cjs"
        # Проверяем на дубликаты
        DB_COUNT=$(grep -c "DATABASE_URL:" ecosystem.config.cjs || echo "0")
        if [ "$DB_COUNT" -gt 1 ]; then
            echo "  ⚠️  ВНИМАНИЕ: Найдено $DB_COUNT вхождений DATABASE_URL (возможны дубликаты!)"
            echo "  📋 Строки с DATABASE_URL:"
            grep -n "DATABASE_URL:" ecosystem.config.cjs | head -5
        else
            echo "  ✅ Только одно вхождение DATABASE_URL (OK)"
        fi
    else
        echo "  ❌ DATABASE_URL не найден в ecosystem.config.cjs"
    fi
else
    echo "  ❌ ecosystem.config.cjs не найден!"
fi

echo ""

# 3. Проверяем статус PM2
echo "3️⃣  Проверка статуса PM2:"
if command -v pm2 >/dev/null 2>&1; then
    pm2 status idylle-spb 2>/dev/null || echo "  ⚠️  Приложение idylle-spb не запущено в PM2"
else
    echo "  ❌ PM2 не установлен"
fi

echo ""

# 4. Проверяем логи PM2 на ошибки БД
echo "4️⃣  Проверка логов PM2 на ошибки БД (последние 50 строк):"
if command -v pm2 >/dev/null 2>&1; then
    pm2 logs idylle-spb --lines 50 --nostream 2>/dev/null | grep -iE "database|prisma|fatal|tenant|connection|error" | tail -10 || echo "  ℹ️  Ошибок БД в логах не найдено"
else
    echo "  ⚠️  PM2 не доступен"
fi

echo ""

# 5. Проверяем подключение через Prisma
echo "5️⃣  Проверка подключения через Prisma:"
if [ -f node_modules/.bin/prisma ]; then
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
        npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 | head -5 || {
            echo "  ❌ Не удалось выполнить запрос к БД"
            echo "  📋 Попробуем проверить через prisma db pull:"
            npx prisma db pull --print 2>&1 | head -10 || echo "  ❌ Не удалось подключиться к БД"
        }
    else
        echo "  ⚠️  .env файл не найден, пропускаю проверку Prisma"
    fi
else
    echo "  ⚠️  Prisma не установлен, пропускаю проверку"
fi

echo ""

# 6. Проверяем API endpoint для товаров
echo "6️⃣  Проверка API endpoint /api/products:"
if command -v curl >/dev/null 2>&1; then
    if pm2 list | grep -q "idylle-spb.*online"; then
        echo "  🔄 Тестирую локальное подключение..."
        curl -s http://localhost:3000/api/products 2>&1 | head -20 || echo "  ❌ Не удалось получить ответ от API"
    else
        echo "  ⚠️  Приложение не запущено, пропускаю проверку API"
    fi
else
    echo "  ⚠️  curl не установлен, пропускаю проверку API"
fi

echo ""
echo "✅ Проверка завершена"
