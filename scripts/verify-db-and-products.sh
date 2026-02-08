#!/bin/bash

# Скрипт для проверки подключения к БД и наличия товаров
# Использование: bash scripts/verify-db-and-products.sh

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

echo "🔍 Проверка подключения к БД и наличия товаров..."
echo ""

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Переменные окружения загружены из .env"
else
    echo "❌ Файл .env не найден!"
    exit 1
fi

# Проверка 1: DATABASE_URL установлен
echo "1️⃣  Проверка DATABASE_URL:"
if [ -z "$DATABASE_URL" ]; then
    echo "  ❌ DATABASE_URL не установлен!"
    exit 1
else
    echo "  ✅ DATABASE_URL установлен"
    # Показываем только хост и порт (без пароля)
    DB_INFO=$(echo "$DATABASE_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@([^:]+):([^/]+)/.*|\2:\3|')
    echo "  📊 Подключение к: $DB_INFO"
fi

echo ""

# Проверка 2: Подключение через Prisma
echo "2️⃣  Проверка подключения через Prisma:"
if [ -f node_modules/.bin/prisma ]; then
    echo "  🔄 Тестирую подключение..."
    if npx prisma db execute --stdin <<< "SELECT 1 as test;" 2>&1 | grep -q "test\|1"; then
        echo "  ✅ Подключение к БД успешно!"
    else
        echo "  ❌ Не удалось подключиться к БД"
        echo "  📋 Детали ошибки:"
        npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 | head -10
        exit 1
    fi
else
    echo "  ⚠️  Prisma не найден, пропускаю проверку"
fi

echo ""

# Проверка 3: Количество товаров в БД
echo "3️⃣  Проверка количества товаров в БД:"
if [ -f node_modules/.bin/prisma ]; then
    PRODUCT_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"Product\" WHERE \"isActive\" = true;" 2>&1 | grep -oE '[0-9]+' | head -1 || echo "0")
    if [ "$PRODUCT_COUNT" != "0" ] && [ -n "$PRODUCT_COUNT" ]; then
        echo "  ✅ Найдено товаров: $PRODUCT_COUNT"
    else
        echo "  ⚠️  Товары не найдены или ошибка при запросе"
        echo "  📋 Попробуем через Prisma Studio или прямой запрос:"
        npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Product\";" 2>&1 | head -5
    fi
else
    echo "  ⚠️  Prisma не найден, пропускаю проверку"
fi

echo ""

# Проверка 4: API endpoint /api/products
echo "4️⃣  Проверка API endpoint /api/products:"
if command -v curl >/dev/null 2>&1; then
    if pm2 list | grep -q "idylle-spb.*online"; then
        echo "  🔄 Тестирую локальное API..."
        API_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3000/api/products 2>&1 || echo "ERROR")
        HTTP_CODE=$(echo "$API_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
        API_BODY=$(echo "$API_RESPONSE" | grep -v "HTTP_CODE")
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "  ✅ API вернул код 200"
            PRODUCT_COUNT_API=$(echo "$API_BODY" | grep -o '"id"' | wc -l || echo "0")
            echo "  📊 Товаров в ответе API: $PRODUCT_COUNT_API"
            if [ "$PRODUCT_COUNT_API" = "0" ]; then
                echo "  ⚠️  ВНИМАНИЕ: API работает, но товары не возвращаются!"
                echo "  📋 Первые 500 символов ответа:"
                echo "$API_BODY" | head -c 500
                echo ""
            fi
        else
            echo "  ❌ API вернул код: $HTTP_CODE"
            echo "  📋 Ответ:"
            echo "$API_BODY" | head -20
        fi
    else
        echo "  ⚠️  Приложение не запущено в PM2, пропускаю проверку API"
    fi
else
    echo "  ⚠️  curl не установлен, пропускаю проверку API"
fi

echo ""

# Проверка 5: Health check endpoint
echo "5️⃣  Проверка Health Check endpoint:"
if command -v curl >/dev/null 2>&1; then
    if pm2 list | grep -q "idylle-spb.*online"; then
        HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health 2>&1 || echo "ERROR")
        if echo "$HEALTH_RESPONSE" | grep -q "database.*connected"; then
            echo "  ✅ Health check показывает подключение к БД"
            echo "$HEALTH_RESPONSE" | grep -E "products|categories|brands" || true
        else
            echo "  ⚠️  Health check не показывает подключение к БД"
            echo "  📋 Ответ:"
            echo "$HEALTH_RESPONSE" | head -10
        fi
    else
        echo "  ⚠️  Приложение не запущено, пропускаю проверку"
    fi
else
    echo "  ⚠️  curl не установлен, пропускаю проверку"
fi

echo ""

# Проверка 6: Логи PM2 на ошибки БД
echo "6️⃣  Проверка логов PM2 на ошибки БД:"
if command -v pm2 >/dev/null 2>&1; then
    DB_ERRORS=$(pm2 logs idylle-spb --lines 100 --nostream 2>&1 | grep -iE "database|prisma|fatal|tenant|connection.*error" | tail -5 || echo "")
    if [ -n "$DB_ERRORS" ]; then
        echo "  ⚠️  Обнаружены ошибки БД в логах:"
        echo "$DB_ERRORS"
    else
        echo "  ✅ Ошибок БД в логах не обнаружено"
    fi
else
    echo "  ⚠️  PM2 не доступен"
fi

echo ""
echo "✅ Проверка завершена"
