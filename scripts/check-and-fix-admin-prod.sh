#!/bin/bash

# Скрипт для проверки и восстановления админа на продакшене

set -e

echo "🔍 Проверяем подключение к базе данных и админа..."

cd /root/idylle-spb

# Принудительно используем локальный PostgreSQL
export DATABASE_URL="postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public"

echo "📊 Проверяем подключение к БД..."

# Проверяем, есть ли таблица users
if PGPASSWORD='wendw@@422ewd!' psql -h localhost -p 5432 -U idylle_user -d idylle_spb -c "\d users" > /dev/null 2>&1; then
    echo "✅ Таблица users существует"
else
    echo "❌ Таблица users не найдена!"
    echo "🔄 Применяем Prisma схему..."
    npx prisma db push --accept-data-loss
    npx prisma generate
fi

echo ""
echo "📋 Проверяем наличие администраторов в БД..."

PGPASSWORD='wendw@@422ewd!' psql -h localhost -p 5432 -U idylle_user -d idylle_spb <<EOF
SELECT id, email, name, role, "isActive" FROM users WHERE role IN ('admin', 'super_admin');
EOF

echo ""
echo "🔧 Запускаем скрипт для создания/восстановления админа..."

# Используем tsx для запуска TypeScript скрипта
npx tsx scripts/fix-admin.ts

echo ""
echo "🔄 Перезапускаем приложение..."
pm2 restart idylle-spb --update-env

echo ""
echo "✅ Готово! Попробуйте войти с:"
echo "   Email: admin@idylle.spb.ru"
echo "   Пароль: admin123"

