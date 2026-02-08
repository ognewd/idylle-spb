#!/bin/bash

# Скрипт для диагностики проблемы без изменений
# Использование: bash scripts/diagnose-issue.sh

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

echo "🔍 Диагностика проблемы (без изменений)..."
echo ""

# 1. Проверка .env файла
echo "1️⃣  Проверка .env файла:"
if [ -f .env ]; then
    echo "  ✅ .env файл найден"
    if grep -q "^DATABASE_URL=" .env; then
        DB_URL=$(grep "^DATABASE_URL=" .env | head -1 | cut -d'=' -f2- | sed "s/^[\"']//;s/[\"']$//")
        DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
        echo "  ✅ DATABASE_URL найден"
        echo "  📊 Host: ${DB_HOST}"
        echo "  📊 Port: ${DB_PORT}"
        echo "  📊 Database: ${DB_NAME}"
    else
        echo "  ❌ DATABASE_URL не найден в .env"
    fi
else
    echo "  ❌ .env файл не найден!"
fi

echo ""

# 2. Проверка ecosystem.config.cjs
echo "2️⃣  Проверка ecosystem.config.cjs:"
if [ -f ecosystem.config.cjs ]; then
    echo "  ✅ ecosystem.config.cjs найден"
    if grep -q "DATABASE_URL:" ecosystem.config.cjs; then
        DB_COUNT=$(grep -c "DATABASE_URL:" ecosystem.config.cjs || echo "0")
        if [ "$DB_COUNT" -gt 1 ]; then
            echo "  ⚠️  ВНИМАНИЕ: Найдено $DB_COUNT вхождений DATABASE_URL (возможны дубликаты!)"
            echo "  📋 Строки с DATABASE_URL:"
            grep -n "DATABASE_URL:" ecosystem.config.cjs | head -5
        else
            echo "  ✅ Только одно вхождение DATABASE_URL"
        fi
        
        # Показываем DATABASE_URL из ecosystem.config.cjs (скрываем пароль)
        ECOSYSTEM_DB=$(grep "DATABASE_URL:" ecosystem.config.cjs | head -1 | sed 's/.*DATABASE_URL:.*@\([^:]*\):.*/\1/')
        echo "  📊 Host в ecosystem.config.cjs: ${ECOSYSTEM_DB}"
    else
        echo "  ❌ DATABASE_URL не найден в ecosystem.config.cjs"
    fi
else
    echo "  ❌ ecosystem.config.cjs не найден!"
fi

echo ""

# 3. Проверка статуса PM2
echo "3️⃣  Проверка статуса PM2:"
if command -v pm2 >/dev/null 2>&1; then
    if pm2 list | grep -q "idylle-spb.*online"; then
        echo "  ✅ Приложение idylle-spb запущено"
        pm2 describe idylle-spb | grep -E "status|pid|uptime|restarts" | head -5
    else
        echo "  ❌ Приложение idylle-spb не запущено или не в статусе 'online'"
        pm2 status
    fi
else
    echo "  ❌ PM2 не установлен"
fi

echo ""

# 4. Проверка подключения к PostgreSQL
echo "4️⃣  Проверка подключения к PostgreSQL:"
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    if [ -n "$DATABASE_URL" ]; then
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        
        echo "  🔄 Проверяю доступность PostgreSQL на ${DB_HOST}:${DB_PORT}..."
        if timeout 3 bash -c "echo > /dev/tcp/${DB_HOST}/${DB_PORT}" 2>/dev/null; then
            echo "  ✅ PostgreSQL доступен на ${DB_HOST}:${DB_PORT}"
        else
            echo "  ❌ PostgreSQL недоступен на ${DB_HOST}:${DB_PORT}"
        fi
    fi
fi

echo ""

# 5. Проверка подключения через Prisma
echo "5️⃣  Проверка подключения через Prisma:"
if [ -f node_modules/.bin/prisma ] && [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "  🔄 Тестирую подключение..."
    PRISMA_TEST=$(npx prisma db execute --stdin <<< "SELECT 1 as test;" 2>&1)
    if echo "$PRISMA_TEST" | grep -qE "test|1|SELECT"; then
        echo "  ✅ Prisma успешно подключился к БД"
    else
        echo "  ❌ Prisma не может подключиться к БД"
        echo "  📋 Ошибка:"
        echo "$PRISMA_TEST" | head -5
    fi
else
    echo "  ⚠️  Prisma не найден или .env не загружен"
fi

echo ""

# 6. Проверка количества товаров в БД
echo "6️⃣  Проверка количества товаров в БД:"
if [ -f node_modules/.bin/prisma ] && [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    PRODUCT_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"Product\" WHERE \"isActive\" = true;" 2>&1 | grep -oE '[0-9]+' | head -1 || echo "0")
    if [ "$PRODUCT_COUNT" != "0" ] && [ -n "$PRODUCT_COUNT" ]; then
        echo "  ✅ Найдено активных товаров: $PRODUCT_COUNT"
    else
        echo "  ⚠️  Товары не найдены или ошибка при запросе"
        TOTAL_PRODUCTS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Product\";" 2>&1 | grep -oE '[0-9]+' | head -1 || echo "0")
        echo "  📊 Всего товаров в БД: $TOTAL_PRODUCTS"
    fi
else
    echo "  ⚠️  Не могу проверить (Prisma не найден)"
fi

echo ""

# 7. Проверка API endpoint
echo "7️⃣  Проверка API endpoint /api/products:"
if command -v curl >/dev/null 2>&1; then
    if pm2 list | grep -q "idylle-spb.*online"; then
        echo "  🔄 Тестирую локальное API..."
        API_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3000/api/products?limit=5 2>&1 || echo "ERROR")
        HTTP_CODE=$(echo "$API_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
        API_BODY=$(echo "$API_RESPONSE" | grep -v "HTTP_CODE")
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "  ✅ API вернул код 200"
            PRODUCT_COUNT_API=$(echo "$API_BODY" | grep -o '"id"' | wc -l || echo "0")
            echo "  📊 Товаров в ответе API: $PRODUCT_COUNT_API"
            if [ "$PRODUCT_COUNT_API" = "0" ]; then
                echo "  ⚠️  ВНИМАНИЕ: API работает, но товары не возвращаются!"
                echo "  📋 Первые 200 символов ответа:"
                echo "$API_BODY" | head -c 200
                echo ""
            fi
        else
            echo "  ❌ API вернул код: $HTTP_CODE"
            echo "  📋 Ответ:"
            echo "$API_BODY" | head -10
        fi
    else
        echo "  ⚠️  Приложение не запущено, пропускаю проверку API"
    fi
else
    echo "  ⚠️  curl не установлен, пропускаю проверку API"
fi

echo ""

# 8. Проверка Health Check endpoint
echo "8️⃣  Проверка Health Check endpoint:"
if command -v curl >/dev/null 2>&1; then
    if pm2 list | grep -q "idylle-spb.*online"; then
        HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health 2>&1 || echo "ERROR")
        if echo "$HEALTH_RESPONSE" | grep -q "database.*connected"; then
            echo "  ✅ Health check показывает подключение к БД"
            PRODUCTS_IN_HEALTH=$(echo "$HEALTH_RESPONSE" | grep -oE '"products":[0-9]+' | grep -oE '[0-9]+' || echo "0")
            echo "  📊 Товаров в health check: $PRODUCTS_IN_HEALTH"
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

# 9. Проверка последних ошибок в логах PM2
echo "9️⃣  Проверка последних ошибок в логах PM2 (последние 30 строк):"
if command -v pm2 >/dev/null 2>&1; then
    ERRORS=$(pm2 logs idylle-spb --lines 30 --nostream 2>&1 | grep -iE "error|fatal|tenant|cannot|timeout" | tail -10 || echo "")
    if [ -n "$ERRORS" ]; then
        echo "  ⚠️  Обнаружены ошибки в логах:"
        echo "$ERRORS"
    else
        echo "  ✅ Ошибок в последних логах не обнаружено"
    fi
else
    echo "  ⚠️  PM2 не доступен"
fi

echo ""

# 10. Проверка переменных окружения в PM2
echo "🔟 Проверка переменных окружения в PM2:"
if command -v pm2 >/dev/null 2>&1 && pm2 list | grep -q "idylle-spb.*online"; then
    PM2_ENV=$(pm2 env 0 2>/dev/null | grep -i "database_url" | head -1 || echo "")
    if [ -n "$PM2_ENV" ]; then
        echo "  ✅ DATABASE_URL найден в переменных окружения PM2"
        echo "  📋 (пароль скрыт): $(echo "$PM2_ENV" | sed 's/@.*/@***/g')"
    else
        echo "  ⚠️  DATABASE_URL не найден в переменных окружения PM2"
        echo "  💡 Возможно, нужно перезапустить PM2 с обновленным ecosystem.config.cjs"
    fi
else
    echo "  ⚠️  PM2 не запущен или процесс не найден"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Диагностика завершена (без изменений)"
echo ""
echo "📋 Рекомендации:"
echo "  - Если DATABASE_URL отличается в .env и ecosystem.config.cjs, запустите:"
echo "    bash scripts/update-ecosystem-env.sh"
echo "  - Если есть дубликаты DATABASE_URL в ecosystem.config.cjs, запустите:"
echo "    bash scripts/fix-db-connection.sh"
echo "  - Если нужно перезапустить PM2:"
echo "    pm2 restart idylle-spb"
