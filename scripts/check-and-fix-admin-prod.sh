#!/bin/bash

# Скрипт для проверки и восстановления админа на продакшене

set -e

echo "🔍 Проверяем подключение к базе данных и админа..."

cd /root/idylle-spb

# Принудительно используем локальный PostgreSQL
# Задайте DATABASE_URL в .env на сервере; для скрипта можно переопределить:
LOCAL_DB_URL="${DATABASE_URL:-postgresql://user:password@localhost:5432/idylle_spb?schema=public}"
export DATABASE_URL="$LOCAL_DB_URL"

echo "📊 Используется DATABASE_URL: ${DATABASE_URL%%@*}@***"

# Проверяем и обновляем .env файл если нужно
if [ -f .env ]; then
    CURRENT_DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"' || echo "")
    if [[ "$CURRENT_DB_URL" != *"localhost"* ]] && [[ "$CURRENT_DB_URL" != *"127.0.0.1"* ]]; then
        echo "⚠️  Обнаружен DATABASE_URL, указывающий на внешнюю базу (не localhost)"
        echo "🔄 Обновляем .env файл для использования локального PostgreSQL..."
        # Создаем резервную копию
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        # Обновляем DATABASE_URL
        if grep -q "^DATABASE_URL=" .env; then
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$LOCAL_DB_URL\"|" .env
        else
            echo "DATABASE_URL=\"$LOCAL_DB_URL\"" >> .env
        fi
        echo "✅ .env файл обновлен"
    fi
fi

echo "📊 Проверяем подключение к БД..."

# Проверяем, есть ли таблица users
# Проверка через psql: задайте PGPASSWORD или используйте .pgpass
if psql -h localhost -p 5432 -U idylle_user -d idylle_spb -c "\d users" > /dev/null 2>&1; then
    echo "✅ Таблица users существует"
else
    echo "❌ Таблица users не найдена!"
    echo "🔄 Применяем Prisma схему..."
    npx prisma db push --accept-data-loss
    npx prisma generate
fi

echo ""
echo "📋 Проверяем наличие администраторов в БД..."

# Пароль возьмите из .env (POSTGRES_PASSWORD) или задайте PGPASSWORD
psql -h localhost -p 5432 -U idylle_user -d idylle_spb <<EOF
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

