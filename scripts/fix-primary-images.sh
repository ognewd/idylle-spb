#!/bin/bash

# Скрипт для исправления множественных основных изображений в базе данных
# Оставляет только одно основное изображение для каждого товара (первое по sortOrder)

echo "🔧 Исправление множественных основных изображений..."

# Загружаем переменные окружения из .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Проверяем наличие DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Ошибка: DATABASE_URL не найден в .env"
  exit 1
fi

# Извлекаем параметры подключения из DATABASE_URL
DB_URL=$(echo $DATABASE_URL | sed 's|postgresql://||')
DB_USER=$(echo $DB_URL | cut -d':' -f1)
DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
DB_PORT=$(echo $DB_URL | cut -d':' -f2 | cut -d'/' -f1)
DB_NAME=$(echo $DB_URL | cut -d'/' -f2 | cut -d'?' -f1)

# Декодируем пароль (заменяем %40 на @ и т.д.)
DB_PASS=$(echo $DB_PASS | sed 's|%40|@|g' | sed 's|%21|!|g')

echo "📊 Подключение к базе данных: $DB_NAME на $DB_HOST:$DB_PORT"

# SQL запрос для исправления множественных основных изображений
SQL="
-- Находим товары с несколькими основными изображениями
WITH multiple_primary AS (
  SELECT 
    \"productId\",
    COUNT(*) as primary_count
  FROM \"ProductImage\"
  WHERE \"isPrimary\" = true
  GROUP BY \"productId\"
  HAVING COUNT(*) > 1
),
-- Находим первое изображение для каждого товара (по sortOrder)
first_image AS (
  SELECT DISTINCT ON (pi.\"productId\")
    pi.id,
    pi.\"productId\"
  FROM \"ProductImage\" pi
  INNER JOIN multiple_primary mp ON pi.\"productId\" = mp.\"productId\"
  WHERE pi.\"isPrimary\" = true
  ORDER BY pi.\"productId\", pi.\"sortOrder\" ASC, pi.id ASC
)
-- Устанавливаем isPrimary = false для всех изображений, кроме первого
UPDATE \"ProductImage\" pi
SET \"isPrimary\" = false
FROM first_image fi
WHERE pi.\"productId\" = fi.\"productId\"
  AND pi.id != fi.id
  AND pi.\"isPrimary\" = true;

-- Показываем результаты
SELECT 
  \"productId\",
  COUNT(*) as primary_count
FROM \"ProductImage\"
WHERE \"isPrimary\" = true
GROUP BY \"productId\"
HAVING COUNT(*) > 1;
"

# Выполняем SQL через psql
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$SQL"

if [ $? -eq 0 ]; then
  echo "✅ Исправление завершено"
else
  echo "❌ Ошибка при выполнении SQL запроса"
  exit 1
fi
