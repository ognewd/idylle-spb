#!/bin/bash

# Скрипт для исправления конфигурации БД на локальную PostgreSQL
# Использование: bash scripts/fix-local-db-config.sh

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

echo "🔧 Исправление конфигурации БД на локальную PostgreSQL..."
echo ""

# Учетные данные для локальной PostgreSQL на сервере
DB_USER="idylle_user"
DB_PASSWORD="wendw@@422ewd!"
DB_NAME="idylle_spb"
DB_HOST="localhost"
DB_PORT="5432"

# URL-encode пароль для DATABASE_URL (особые символы: @ = %40, ! = %21)
DB_PASSWORD_ENCODED="wendw%40%40422ewd%21"

# Правильный DATABASE_URL для локальной PostgreSQL
CORRECT_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

echo "📋 Правильный DATABASE_URL:"
echo "   postgresql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
echo ""

# 1. Проверяем подключение к локальной БД
echo "1️⃣  Проверка подключения к локальной PostgreSQL:"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "  ✅ Подключение к локальной PostgreSQL успешно!"
    
    # Проверяем количество товаров
    TOTAL_PRODUCTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"Product\";" 2>/dev/null || echo "0")
    ACTIVE_PRODUCTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"Product\" WHERE \"isActive\" = true;" 2>/dev/null || echo "0")
    echo "  📊 Всего товаров в БД: $TOTAL_PRODUCTS"
    echo "  📊 Активных товаров в БД: $ACTIVE_PRODUCTS"
    if [ "$ACTIVE_PRODUCTS" = "0" ] && [ "$TOTAL_PRODUCTS" != "0" ]; then
        echo "  ⚠️  ВНИМАНИЕ: Все товары неактивны! Проверьте поле isActive в таблице Product."
    fi
else
    echo "  ❌ Не удалось подключиться к локальной PostgreSQL!"
    echo "  💡 Проверьте, что PostgreSQL запущен и учетные данные правильные"
    exit 1
fi

echo ""

# 2. Обновляем .env файл
echo "2️⃣  Обновление .env файла:"
if [ ! -f .env ]; then
    echo "  📝 Создаю .env файл из примера..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "  ❌ .env.example не найден!"
        exit 1
    fi
fi

# Создаем резервную копию
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Обновляем или добавляем DATABASE_URL
if grep -q "^DATABASE_URL=" .env; then
    # Заменяем существующий DATABASE_URL
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${CORRECT_DATABASE_URL}\"|" .env
    echo "  ✅ DATABASE_URL обновлен в .env"
else
    # Добавляем DATABASE_URL в начало файла
    sed -i "1i DATABASE_URL=\"${CORRECT_DATABASE_URL}\"" .env
    echo "  ✅ DATABASE_URL добавлен в .env"
fi

echo ""

# 3. Обновляем ecosystem.config.cjs
echo "3️⃣  Обновление ecosystem.config.cjs:"
if [ ! -f ecosystem.config.cjs ]; then
    echo "  📝 Создаю ecosystem.config.cjs из примера..."
    if [ -f ecosystem.config.cjs.example ]; then
        cp ecosystem.config.cjs.example ecosystem.config.cjs
    else
        echo "  ❌ ecosystem.config.cjs.example не найден!"
        exit 1
    fi
fi

# Создаем резервную копию
cp ecosystem.config.cjs ecosystem.config.cjs.backup.$(date +%Y%m%d_%H%M%S)

# Удаляем все вхождения DATABASE_URL
sed -i '/DATABASE_URL:/d' ecosystem.config.cjs

# Добавляем правильный DATABASE_URL после NODE_ENV
ESCAPED_DB_URL=$(echo "$CORRECT_DATABASE_URL" | sed "s/'/'\"'\"'/g")
sed -i "/NODE_ENV: 'production',/a\      DATABASE_URL: '${ESCAPED_DB_URL}'," ecosystem.config.cjs

# Проверяем на дубликаты
DB_COUNT=$(grep -c "DATABASE_URL:" ecosystem.config.cjs || echo "0")
if [ "$DB_COUNT" -gt 1 ]; then
    echo "  ⚠️  Найдено $DB_COUNT вхождений DATABASE_URL, удаляю дубликаты..."
    # Оставляем только первое вхождение
    awk '/DATABASE_URL:/ && !found {found=1; print; next} /DATABASE_URL:/ {next} {print}' ecosystem.config.cjs > ecosystem.config.cjs.tmp
    mv ecosystem.config.cjs.tmp ecosystem.config.cjs
fi

# Проверяем синтаксис
if node -c ecosystem.config.cjs 2>/dev/null; then
    echo "  ✅ Синтаксис ecosystem.config.cjs корректен"
else
    echo "  ❌ Синтаксическая ошибка в ecosystem.config.cjs!"
    echo "  📋 Первые 30 строк файла:"
    head -30 ecosystem.config.cjs
    exit 1
fi

echo ""

# 4. Перезапускаем PM2
echo "4️⃣  Перезапуск PM2:"
pm2 delete idylle-spb 2>/dev/null || true
sleep 2

if [ -f ecosystem.config.cjs ]; then
    pm2 start ecosystem.config.cjs
    pm2 save
    echo "  ✅ PM2 перезапущен с обновленной конфигурацией"
else
    echo "  ❌ ecosystem.config.cjs не найден!"
    exit 1
fi

echo ""

# 5. Проверяем подключение через приложение
echo "5️⃣  Проверка подключения через приложение:"
sleep 5

# Проверяем health endpoint
if command -v curl >/dev/null 2>&1; then
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health 2>&1 || echo "ERROR")
    if echo "$HEALTH_RESPONSE" | grep -q "database.*connected"; then
        echo "  ✅ Health check показывает подключение к БД"
        PRODUCTS_IN_HEALTH=$(echo "$HEALTH_RESPONSE" | grep -oE '"products":[0-9]+' | grep -oE '[0-9]+' || echo "0")
        ACTIVE_PRODUCTS_IN_HEALTH=$(echo "$HEALTH_RESPONSE" | grep -oE '"activeProducts":[0-9]+' | grep -oE '[0-9]+' || echo "0")
        echo "  📊 Всего товаров в health check: $PRODUCTS_IN_HEALTH"
        echo "  📊 Активных товаров в health check: $ACTIVE_PRODUCTS_IN_HEALTH"
    else
        echo "  ⚠️  Health check не показывает подключение к БД"
        echo "  📋 Ответ:"
        echo "$HEALTH_RESPONSE" | head -5
    fi
fi

echo ""

# 6. Проверяем логи на ошибки
echo "6️⃣  Проверка логов PM2 (последние 10 строк):"
pm2 logs idylle-spb --lines 10 --nostream | grep -iE "database|prisma|fatal|tenant|error" | tail -5 || echo "  ✅ Ошибок БД в последних логах не найдено"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Конфигурация БД исправлена!"
echo ""
echo "📋 Что было сделано:"
echo "  ✅ Обновлен DATABASE_URL в .env"
echo "  ✅ Обновлен DATABASE_URL в ecosystem.config.cjs"
echo "  ✅ Удалены дубликаты DATABASE_URL"
echo "  ✅ PM2 перезапущен с новой конфигурацией"
echo ""
echo "📝 Следующие шаги:"
echo "  1. Проверьте логи: pm2 logs idylle-spb --lines 50"
echo "  2. Проверьте API: curl http://localhost:3000/api/products?limit=5"
echo "  3. Проверьте сайт в браузере"
