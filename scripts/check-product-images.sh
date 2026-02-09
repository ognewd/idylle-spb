#!/bin/bash

# Скрипт для проверки изображений товара в БД
# Использование: bash scripts/check-product-images.sh [slug]

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

SLUG="${1:-aromaticheskaya-svecha-cafe-satin-450-gr-skyline-art-442112}"

echo "🔍 Проверка изображений товара: $SLUG"
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
    # Парсим DATABASE_URL
    DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
    DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p' | sed 's|%40|@|g' | sed 's|%21|!|g')
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
    DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
fi

# Проверяем подключение
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Не удалось подключиться к БД!"
    exit 1
fi

echo "✅ Подключение к БД успешно!"
echo ""

# Находим ID товара по slug
PRODUCT_ID=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT id FROM \"Product\" WHERE slug = '$SLUG' LIMIT 1;" 2>/dev/null || echo "")

if [ -z "$PRODUCT_ID" ]; then
    echo "❌ Товар с slug '$SLUG' не найден!"
    exit 1
fi

echo "📦 ID товара: $PRODUCT_ID"
echo ""

# Получаем информацию о товаре
PRODUCT_NAME=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT name FROM \"Product\" WHERE id = '$PRODUCT_ID';" 2>/dev/null || echo "")
echo "📝 Название: $PRODUCT_NAME"
echo ""

# Получаем все изображения товара
echo "🖼️  Изображения товара:"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    id,
    url,
    \"isPrimary\",
    \"sortOrder\",
    alt,
    \"createdAt\"
FROM \"ProductImage\"
WHERE \"productId\" = '$PRODUCT_ID'
ORDER BY \"isPrimary\" DESC, \"sortOrder\" ASC;
" 2>/dev/null || echo "❌ Ошибка при получении изображений"

echo ""
TOTAL_IMAGES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"ProductImage\" WHERE \"productId\" = '$PRODUCT_ID';" 2>/dev/null || echo "0")
PRIMARY_IMAGES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"ProductImage\" WHERE \"productId\" = '$PRODUCT_ID' AND \"isPrimary\" = true;" 2>/dev/null || echo "0")
ADDITIONAL_IMAGES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM \"ProductImage\" WHERE \"productId\" = '$PRODUCT_ID' AND \"isPrimary\" = false;" 2>/dev/null || echo "0")

echo "📊 Статистика:"
echo "   Всего изображений: $TOTAL_IMAGES"
echo "   Главных изображений: $PRIMARY_IMAGES"
echo "   Дополнительных изображений: $ADDITIONAL_IMAGES"

if [ "$ADDITIONAL_IMAGES" = "0" ] && [ "$TOTAL_IMAGES" = "1" ]; then
    echo ""
    echo "⚠️  ВНИМАНИЕ: У товара только одно изображение (главное)."
    echo "   Дополнительные изображения отсутствуют."
    echo ""
    echo "💡 Возможные причины:"
    echo "   1. Колонка 'Дополнительное изображение' не была распознана при импорте"
    echo "   2. В колонке не было валидных URL"
    echo "   3. Изображения не были загружены из-за ошибок"
    echo ""
    echo "📝 Проверьте логи импорта для этого товара"
fi

echo ""
