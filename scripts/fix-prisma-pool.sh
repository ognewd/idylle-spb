#!/bin/bash

# Скрипт для исправления Prisma connection pool timeout
# Использование: bash scripts/fix-prisma-pool.sh

set -e

echo "🔧 Исправление Prisma connection pool..."

cd /root/idylle-spb || exit 1

if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    exit 1
fi

# Проверяем текущий DATABASE_URL
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL не найден в .env!"
    exit 1
fi

echo "📋 Текущий DATABASE_URL: ${DATABASE_URL%%@*}@***"

# Проверяем, есть ли уже параметры пула
if echo "$DATABASE_URL" | grep -q "connection_limit"; then
    echo "⚠️  Параметры пула уже установлены"
    echo "📋 Текущие параметры:"
    echo "$DATABASE_URL" | grep -o "connection_limit=[^&]*" || echo "  connection_limit не найден"
    echo "$DATABASE_URL" | grep -o "pool_timeout=[^&]*" || echo "  pool_timeout не найден"
else
    echo "📝 Добавляю параметры пула..."
    
    # Добавляем параметры пула
    if echo "$DATABASE_URL" | grep -q "?"; then
        # Уже есть параметры, добавляем через &
        NEW_DATABASE_URL="${DATABASE_URL}&connection_limit=20&pool_timeout=20"
    else
        # Нет параметров, добавляем через ?
        NEW_DATABASE_URL="${DATABASE_URL}?connection_limit=20&pool_timeout=20"
    fi
    
    # Обновляем .env
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DATABASE_URL}\"|" .env
    
    echo "✅ Параметры пула добавлены:"
    echo "  connection_limit=20"
    echo "  pool_timeout=20"
fi

# Перезапускаем PM2
echo ""
echo "🔄 Перезапуск PM2..."
pm2 restart idylle-spb --update-env

echo ""
echo "✅ Готово!"
echo "📋 Проверьте логи: pm2 logs idylle-spb --lines 20"
