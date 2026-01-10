#!/bin/bash

# Скрипт для применения миграции pageContent на сервере
# Использование: ./scripts/apply-pagecontent-migration.sh

echo "📝 Применяем миграцию для добавления поля pageContent..."

# Проверяем, что мы на сервере
if [ ! -f "/root/idylle-spb/package.json" ]; then
    echo "❌ Ошибка: Скрипт должен выполняться на сервере в директории /root/idylle-spb"
    exit 1
fi

cd /root/idylle-spb

# Применяем миграцию через Prisma
echo "🔄 Применяем изменения схемы через Prisma..."
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Миграция успешно применена!"
    echo "📋 Поле pageContent добавлено в таблицу categories"
else
    echo "❌ Ошибка при применении миграции"
    echo "💡 Попробуйте выполнить SQL скрипт вручную:"
    echo "   psql -U idylle_user -d idylle_spb -f scripts/add-pagecontent-migration.sql"
    exit 1
fi

