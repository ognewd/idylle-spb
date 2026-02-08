#!/bin/bash

# Скрипт для исправления подключения к БД
# Использование: bash scripts/fix-db-connection.sh

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

echo "🔧 Исправление подключения к базе данных..."
echo ""

# 1. Проверяем .env файл
echo "1️⃣  Проверка .env файла:"
if [ ! -f .env ]; then
    echo "  ❌ Файл .env не найден!"
    exit 1
fi

if ! grep -q "^DATABASE_URL=" .env; then
    echo "  ❌ DATABASE_URL не найден в .env!"
    exit 1
fi

DATABASE_URL=$(grep "^DATABASE_URL=" .env | head -1 | cut -d'=' -f2- | sed "s/^[\"']//;s/[\"']$//")
echo "  ✅ DATABASE_URL найден в .env"
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
echo "  📊 Host: ${DB_HOST}"
echo "  📊 Port: ${DB_PORT}"

echo ""

# 2. Обновляем ecosystem.config.cjs
echo "2️⃣  Обновление ecosystem.config.cjs:"
if [ ! -f ecosystem.config.cjs ]; then
    echo "  ❌ ecosystem.config.cjs не найден!"
    if [ -f ecosystem.config.cjs.example ]; then
        echo "  📝 Создаю из примера..."
        cp ecosystem.config.cjs.example ecosystem.config.cjs
    else
        exit 1
    fi
fi

# Запускаем скрипт обновления
if [ -f scripts/update-ecosystem-env.sh ]; then
    echo "  🔄 Запускаю update-ecosystem-env.sh..."
    bash scripts/update-ecosystem-env.sh || {
        echo "  ⚠️  Скрипт обновления завершился с ошибкой, пробую вручную..."
        
        # Удаляем все вхождения DATABASE_URL
        sed -i '/DATABASE_URL:/d' ecosystem.config.cjs
        
        # Добавляем правильный DATABASE_URL после NODE_ENV
        ESCAPED_DB_URL=$(echo "$DATABASE_URL" | sed "s/'/'\"'\"'/g")
        sed -i "/NODE_ENV: 'production',/a\      DATABASE_URL: '${ESCAPED_DB_URL}'," ecosystem.config.cjs
    }
else
    echo "  ⚠️  Скрипт update-ecosystem-env.sh не найден, обновляю вручную..."
    # Удаляем все вхождения DATABASE_URL
    sed -i '/DATABASE_URL:/d' ecosystem.config.cjs
    
    # Добавляем правильный DATABASE_URL после NODE_ENV
    ESCAPED_DB_URL=$(echo "$DATABASE_URL" | sed "s/'/'\"'\"'/g")
    sed -i "/NODE_ENV: 'production',/a\      DATABASE_URL: '${ESCAPED_DB_URL}'," ecosystem.config.cjs
fi

echo "  ✅ ecosystem.config.cjs обновлен"

# Проверяем синтаксис
echo "  🔍 Проверка синтаксиса..."
if node -c ecosystem.config.cjs 2>/dev/null; then
    echo "  ✅ Синтаксис корректен"
else
    echo "  ❌ Синтаксическая ошибка в ecosystem.config.cjs!"
    echo "  📋 Первые 30 строк файла:"
    head -30 ecosystem.config.cjs
    exit 1
fi

echo ""

# 3. Проверяем количество вхождений DATABASE_URL
echo "3️⃣  Проверка на дубликаты DATABASE_URL:"
DB_COUNT=$(grep -c "DATABASE_URL:" ecosystem.config.cjs || echo "0")
if [ "$DB_COUNT" -gt 1 ]; then
    echo "  ⚠️  Найдено $DB_COUNT вхождений DATABASE_URL (должно быть 1)!"
    echo "  🔧 Удаляю дубликаты..."
    # Оставляем только первое вхождение
    awk '/DATABASE_URL:/ && !found {found=1; print; next} /DATABASE_URL:/ {next} {print}' ecosystem.config.cjs > ecosystem.config.cjs.tmp
    mv ecosystem.config.cjs.tmp ecosystem.config.cjs
    echo "  ✅ Дубликаты удалены"
else
    echo "  ✅ Только одно вхождение DATABASE_URL (OK)"
fi

echo ""

# 4. Перезапускаем PM2
echo "4️⃣  Перезапуск PM2:"
pm2 delete idylle-spb 2>/dev/null || true
sleep 1

if [ -f ecosystem.config.cjs ]; then
    pm2 start ecosystem.config.cjs
    pm2 save
    echo "  ✅ PM2 перезапущен с обновленной конфигурацией"
else
    echo "  ❌ ecosystem.config.cjs не найден!"
    exit 1
fi

echo ""

# 5. Проверяем статус
echo "5️⃣  Проверка статуса:"
sleep 3
pm2 status

echo ""

# 6. Проверяем логи на ошибки БД
echo "6️⃣  Проверка логов (последние 10 строк):"
pm2 logs idylle-spb --lines 10 --nostream | grep -iE "database|prisma|fatal|tenant|error" | tail -5 || echo "  ℹ️  Ошибок БД в последних логах не найдено"

echo ""
echo "✅ Исправление завершено!"
echo ""
echo "📋 Следующие шаги:"
echo "  1. Проверьте логи: pm2 logs idylle-spb --lines 50"
echo "  2. Проверьте API: curl http://localhost:3000/api/health"
echo "  3. Если проблемы остались, проверьте DATABASE_URL в .env"
