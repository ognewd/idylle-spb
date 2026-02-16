#!/bin/bash

# Скрипт для проверки статуса товаров и их активации
# Использование: 
#   bash scripts/check-and-activate-products.sh          # только проверка
#   bash scripts/check-and-activate-products.sh activate # проверка + активация всех товаров

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

echo "🔍 Проверка статуса товаров в БД..."
echo ""

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Параметры подключения из DATABASE_URL или дефолтные
if [ -z "$DATABASE_URL" ]; then
    DB_USER="idylle_user"
    DB_PASSWORD="wendw@@422ewd!"
    DB_NAME="idylle_spb"
    DB_HOST="localhost"
    DB_PORT="5432"
else
    # Парсим DATABASE_URL: postgresql://user:password@host:port/database
    DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
    DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p' | sed 's|%40|@|g' | sed 's|%21|!|g')
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
    DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
fi

echo "📋 Параметры подключения:"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Проверяем подключение
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Не удалось подключиться к БД!"
    exit 1
fi

echo "✅ Подключение к БД успешно!"
echo ""

# Получаем статистику
TOTAL_PRODUCTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"Product\";" 2>/dev/null || echo "0")
ACTIVE_PRODUCTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"Product\" WHERE \"isActive\" = true;" 2>/dev/null || echo "0")
INACTIVE_PRODUCTS=$((TOTAL_PRODUCTS - ACTIVE_PRODUCTS))

echo "📊 Статистика товаров:"
echo "   Всего товаров: $TOTAL_PRODUCTS"
echo "   ✅ Активных: $ACTIVE_PRODUCTS"
echo "   ❌ Неактивных: $INACTIVE_PRODUCTS"
echo ""

if [ "$ACTIVE_PRODUCTS" = "0" ] && [ "$TOTAL_PRODUCTS" != "0" ]; then
    echo "⚠️  ВНИМАНИЕ: Все товары неактивны!"
    echo ""
    
    if [ "$1" = "activate" ]; then
        echo "🔄 Активирую все товары..."
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "UPDATE \"Product\" SET \"isActive\" = true WHERE \"isActive\" = false;" > /dev/null 2>&1
        
        # Проверяем результат
        NEW_ACTIVE=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"Product\" WHERE \"isActive\" = true;" 2>/dev/null || echo "0")
        
        if [ "$NEW_ACTIVE" = "$TOTAL_PRODUCTS" ]; then
            echo "✅ Все товары успешно активированы!"
            echo "   Теперь активных товаров: $NEW_ACTIVE"
        else
            echo "⚠️  Активация завершена, но количество активных товаров ($NEW_ACTIVE) не совпадает с общим ($TOTAL_PRODUCTS)"
        fi
    else
        echo "💡 Для активации всех товаров выполните:"
        echo "   bash scripts/check-and-activate-products.sh activate"
        echo ""
        echo "   Или вручную через SQL:"
        echo "   UPDATE \"Product\" SET \"isActive\" = true WHERE \"isActive\" = false;"
    fi
elif [ "$INACTIVE_PRODUCTS" != "0" ]; then
    echo "ℹ️  Есть неактивные товары ($INACTIVE_PRODUCTS из $TOTAL_PRODUCTS)"
    if [ "$1" = "activate" ]; then
        echo "🔄 Активирую неактивные товары..."
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "UPDATE \"Product\" SET \"isActive\" = true WHERE \"isActive\" = false;" > /dev/null 2>&1
        NEW_ACTIVE=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"Product\" WHERE \"isActive\" = true;" 2>/dev/null || echo "0")
        echo "✅ Неактивные товары активированы!"
        echo "   Теперь активных товаров: $NEW_ACTIVE"
    fi
else
    echo "✅ Все товары активны!"
fi

echo ""
