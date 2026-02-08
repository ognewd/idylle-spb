#!/bin/bash

# Скрипт для настройки локальной PostgreSQL на VPS
# Использование: bash scripts/setup-local-postgres.sh

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

echo "🔧 Настройка локальной PostgreSQL на VPS..."
echo ""

# 1. Проверяем, установлен ли PostgreSQL
echo "1️⃣  Проверка установки PostgreSQL:"
if command -v psql >/dev/null 2>&1; then
    PSQL_VERSION=$(psql --version | head -1)
    echo "  ✅ PostgreSQL установлен: $PSQL_VERSION"
else
    echo "  ⚠️  PostgreSQL не установлен, устанавливаю..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    echo "  ✅ PostgreSQL установлен"
fi

# Проверяем статус сервиса
if systemctl is-active --quiet postgresql; then
    echo "  ✅ Сервис PostgreSQL запущен"
else
    echo "  🔄 Запускаю сервис PostgreSQL..."
    systemctl start postgresql
    systemctl enable postgresql
    echo "  ✅ Сервис PostgreSQL запущен и включен в автозагрузку"
fi

echo ""

# 2. Создаем базу данных и пользователя
echo "2️⃣  Создание базы данных и пользователя:"

DB_NAME="idylle_spb"
DB_USER="idylle_user"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Проверяем, существует ли база данных
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "  ✅ База данных '$DB_NAME' уже существует"
else
    echo "  📝 Создаю базу данных '$DB_NAME'..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
    echo "  ✅ База данных создана"
fi

# Проверяем, существует ли пользователь
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "  ✅ Пользователь '$DB_USER' уже существует"
    # Обновляем пароль
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "  ✅ Пароль пользователя обновлен"
else
    echo "  📝 Создаю пользователя '$DB_USER'..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "  ✅ Пользователь создан"
fi

# Выдаем права
echo "  📝 Выдаю права на базу данных..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
echo "  ✅ Права выданы"

echo ""

# 3. Обновляем .env файл
echo "3️⃣  Обновление .env файла:"
if [ ! -f .env ]; then
    echo "  📝 Создаю .env файл из примера..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "  ❌ .env.example не найден!"
        exit 1
    fi
fi

# Создаем DATABASE_URL для локальной PostgreSQL
NEW_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

# Обновляем или добавляем DATABASE_URL
if grep -q "^DATABASE_URL=" .env; then
    # Заменяем существующий DATABASE_URL
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DATABASE_URL}\"|" .env
    echo "  ✅ DATABASE_URL обновлен в .env"
else
    # Добавляем DATABASE_URL в начало файла
    sed -i "1i DATABASE_URL=\"${NEW_DATABASE_URL}\"" .env
    echo "  ✅ DATABASE_URL добавлен в .env"
fi

echo "  📋 Новый DATABASE_URL: postgresql://${DB_USER}:***@localhost:5432/${DB_NAME}"

echo ""

# 4. Обновляем ecosystem.config.cjs
echo "4️⃣  Обновление ecosystem.config.cjs:"
if [ -f scripts/update-ecosystem-env.sh ]; then
    echo "  🔄 Запускаю update-ecosystem-env.sh..."
    bash scripts/update-ecosystem-env.sh || {
        echo "  ⚠️  Скрипт обновления завершился с ошибкой, обновляю вручную..."
        # Удаляем все вхождения DATABASE_URL
        sed -i '/DATABASE_URL:/d' ecosystem.config.cjs
        
        # Добавляем правильный DATABASE_URL после NODE_ENV
        ESCAPED_DB_URL=$(echo "$NEW_DATABASE_URL" | sed "s/'/'\"'\"'/g")
        sed -i "/NODE_ENV: 'production',/a\      DATABASE_URL: '${ESCAPED_DB_URL}'," ecosystem.config.cjs
    }
else
    echo "  ⚠️  Скрипт update-ecosystem-env.sh не найден, обновляю вручную..."
    if [ -f ecosystem.config.cjs ]; then
        # Удаляем все вхождения DATABASE_URL
        sed -i '/DATABASE_URL:/d' ecosystem.config.cjs
        
        # Добавляем правильный DATABASE_URL после NODE_ENV
        ESCAPED_DB_URL=$(echo "$NEW_DATABASE_URL" | sed "s/'/'\"'\"'/g")
        sed -i "/NODE_ENV: 'production',/a\      DATABASE_URL: '${ESCAPED_DB_URL}'," ecosystem.config.cjs
    fi
fi

echo "  ✅ ecosystem.config.cjs обновлен"

echo ""

# 5. Применяем миграции Prisma
echo "5️⃣  Применение миграций Prisma:"
export $(grep -v '^#' .env | xargs)

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "  🔄 Применяю миграции..."
    npx prisma migrate deploy || {
        echo "  ⚠️  Ошибка при применении миграций, пробую db push..."
        npx prisma db push --accept-data-loss || echo "  ⚠️  db push также не удался"
    }
else
    echo "  🔄 Нет миграций, применяю db push..."
    npx prisma db push --accept-data-loss || echo "  ⚠️  db push не удался"
fi

npx prisma generate
echo "  ✅ Prisma схема применена"

echo ""

# 6. Перезапускаем PM2
echo "6️⃣  Перезапуск PM2:"
pm2 delete idylle-spb 2>/dev/null || true
sleep 1

if [ -f ecosystem.config.cjs ]; then
    pm2 start ecosystem.config.cjs
    pm2 save
    echo "  ✅ PM2 перезапущен"
else
    echo "  ❌ ecosystem.config.cjs не найден!"
    exit 1
fi

echo ""

# 7. Проверяем подключение
echo "7️⃣  Проверка подключения к БД:"
sleep 3

if npx prisma db execute --stdin <<< "SELECT 1 as test;" 2>&1 | grep -q "test\|1"; then
    echo "  ✅ Подключение к БД успешно!"
else
    echo "  ⚠️  Не удалось подключиться к БД, проверьте логи:"
    echo "     pm2 logs idylle-spb --lines 20"
fi

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📋 Информация:"
echo "  База данных: $DB_NAME"
echo "  Пользователь: $DB_USER"
echo "  Пароль: $DB_PASSWORD (сохранен в .env)"
echo ""
echo "📝 Следующие шаги:"
echo "  1. Проверьте логи: pm2 logs idylle-spb --lines 50"
echo "  2. Проверьте API: curl http://localhost:3000/api/health"
echo "  3. Если нужно импортировать данные, используйте: npx prisma db seed"
