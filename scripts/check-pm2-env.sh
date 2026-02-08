#!/bin/bash

# Скрипт для проверки переменных окружения в PM2
# Использование: bash scripts/check-pm2-env.sh

set -e

cd /root/idylle-spb 2>/dev/null || cd "$(dirname "$0")/.." || exit 1

echo "🔍 Проверка переменных окружения в PM2..."
echo ""

# Проверяем, запущен ли PM2
if ! command -v pm2 >/dev/null 2>&1; then
    echo "❌ PM2 не установлен"
    exit 1
fi

# Проверяем статус приложения
if ! pm2 list | grep -q "idylle-spb.*online"; then
    echo "❌ Приложение idylle-spb не запущено в PM2"
    echo "📋 Текущий статус PM2:"
    pm2 status
    exit 1
fi

echo "✅ Приложение idylle-spb запущено"
echo ""

# Получаем информацию о процессе
echo "1️⃣  Информация о процессе PM2:"
pm2 describe idylle-spb | grep -E "status|pid|uptime|restarts" | head -10
echo ""

# Проверяем переменные окружения из ecosystem.config.cjs
echo "2️⃣  Переменные окружения из ecosystem.config.cjs:"
if [ -f ecosystem.config.cjs ]; then
    echo "  📋 DATABASE_URL:"
    grep "DATABASE_URL:" ecosystem.config.cjs | head -1 | sed 's/.*DATABASE_URL:.*/  &/' | sed 's/@.*/@***/'
    echo ""
    echo "  📋 NEXTAUTH_URL:"
    grep "NEXTAUTH_URL:" ecosystem.config.cjs | head -1 | sed 's/.*NEXTAUTH_URL:.*/  &/' || echo "  ⚠️  Не найден"
    echo ""
    echo "  📋 UPLOADS_DIR:"
    grep "UPLOADS_DIR:" ecosystem.config.cjs | head -1 | sed 's/.*UPLOADS_DIR:.*/  &/' || echo "  ⚠️  Не найден"
else
    echo "  ❌ ecosystem.config.cjs не найден"
fi

echo ""

# Проверяем переменные окружения в .env
echo "3️⃣  Переменные окружения из .env:"
if [ -f .env ]; then
    echo "  📋 DATABASE_URL:"
    grep "^DATABASE_URL=" .env | head -1 | sed 's/@.*/@***/' || echo "  ⚠️  Не найден"
    echo ""
    echo "  📋 NEXTAUTH_URL:"
    grep "^NEXTAUTH_URL=" .env | head -1 || echo "  ⚠️  Не найден"
    echo ""
    echo "  📋 UPLOADS_DIR:"
    grep "^UPLOADS_DIR=" .env | head -1 || echo "  ⚠️  Не найден"
else
    echo "  ❌ .env файл не найден"
fi

echo ""

# Проверяем, что PM2 использует правильный конфиг
echo "4️⃣  Проверка конфигурации PM2:"
PM2_ENV=$(pm2 env 0 2>/dev/null | grep -i "database_url\|nextauth" | head -5 || echo "")
if [ -n "$PM2_ENV" ]; then
    echo "  ✅ Переменные окружения в PM2:"
    echo "$PM2_ENV" | sed 's/@.*/@***/g'
else
    echo "  ⚠️  Не удалось получить переменные окружения из PM2"
fi

echo ""

# Проверяем логи на наличие DATABASE_URL
echo "5️⃣  Проверка логов на упоминания DATABASE_URL:"
LOG_MENTIONS=$(pm2 logs idylle-spb --lines 100 --nostream 2>&1 | grep -i "database_url\|datasource" | tail -3 || echo "")
if [ -n "$LOG_MENTIONS" ]; then
    echo "  📋 Упоминания в логах:"
    echo "$LOG_MENTIONS" | sed 's/@.*/@***/g'
else
    echo "  ℹ️  Упоминаний DATABASE_URL в логах не найдено"
fi

echo ""

# Рекомендации
echo "6️⃣  Рекомендации:"
if [ -f ecosystem.config.cjs ] && [ -f .env ]; then
    DB_URL_ENV=$(grep "^DATABASE_URL=" .env | head -1 | cut -d'=' -f2-)
    DB_URL_ECOSYSTEM=$(grep "DATABASE_URL:" ecosystem.config.cjs | head -1 | sed "s/.*DATABASE_URL: '\(.*\)',.*/\1/")
    
    if [ -n "$DB_URL_ENV" ] && [ -n "$DB_URL_ECOSYSTEM" ]; then
        # Сравниваем хост и порт
        ENV_HOST=$(echo "$DB_URL_ENV" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        ECOSYSTEM_HOST=$(echo "$DB_URL_ECOSYSTEM" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        
        if [ "$ENV_HOST" != "$ECOSYSTEM_HOST" ]; then
            echo "  ⚠️  ВНИМАНИЕ: DATABASE_URL в .env и ecosystem.config.cjs различаются!"
            echo "  💡 Запустите: bash scripts/update-ecosystem-env.sh"
        else
            echo "  ✅ DATABASE_URL совпадает в .env и ecosystem.config.cjs"
        fi
    fi
fi

echo ""
echo "✅ Проверка завершена"
