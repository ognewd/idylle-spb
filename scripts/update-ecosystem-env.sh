#!/bin/bash

# Скрипт для обновления ecosystem.config.cjs с переменными из .env
# Использование: bash scripts/update-ecosystem-env.sh

set -e

# Определяем рабочую директорию
if [ -d "/root/idylle-spb" ]; then
    cd /root/idylle-spb
else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
    cd "$PROJECT_DIR" || exit 1
fi

if [ ! -f ecosystem.config.cjs ]; then
    echo "❌ ecosystem.config.cjs не найден!"
    exit 1
fi

if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден, пропускаю обновление"
    exit 0
fi

echo "🔧 Обновляю ecosystem.config.cjs с переменными из .env..."

# Читаем переменные из .env (безопасно, с обработкой ошибок)
DATABASE_URL=""
NEXTAUTH_URL=""
NEXTAUTH_SECRET=""
UPLOADS_DIR=""

if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | head -1 | cut -d'=' -f2- | sed "s/^[\"']//;s/[\"']$//")
    
    # Проверяем, не является ли это Supabase URL (не используем Supabase)
    if echo "$DATABASE_URL" | grep -qE "supabase|aws-1-us-east-1\.pooler\.supabase"; then
        echo "⚠️  Обнаружен Supabase DATABASE_URL в .env, используем локальный PostgreSQL вместо него"
        # Используем правильный локальный PostgreSQL URL
        DB_USER="idylle_user"
        DB_PASSWORD_ENCODED="wendw%40%40422ewd%21"
        DB_HOST="localhost"
        DB_PORT="5432"
        DB_NAME="idylle_spb"
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
        echo "  ✓ Используется локальный PostgreSQL: postgresql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        
        # Также обновляем .env файл, чтобы исправить его
        if grep -q "^DATABASE_URL=" .env; then
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env
            echo "  ✓ Обновлен DATABASE_URL в .env файле"
        fi
    fi
fi

if grep -q "^NEXTAUTH_URL=" .env 2>/dev/null; then
    NEXTAUTH_URL=$(grep "^NEXTAUTH_URL=" .env | head -1 | cut -d'=' -f2- | sed "s/^[\"']//;s/[\"']$//")
fi

if grep -q "^NEXTAUTH_SECRET=" .env 2>/dev/null; then
    NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env | head -1 | cut -d'=' -f2- | sed "s/^[\"']//;s/[\"']$//")
fi

if grep -q "^UPLOADS_DIR=" .env 2>/dev/null; then
    UPLOADS_DIR=$(grep "^UPLOADS_DIR=" .env | head -1 | cut -d'=' -f2- | sed "s/^[\"']//;s/[\"']$//")
fi

# Функция для безопасного экранирования одинарных кавычек
escape_for_sed() {
    echo "$1" | sed "s/'/'\"'\"'/g"
}

# Функция для удаления всех вхождений переменной из файла
remove_var() {
    local var_name="$1"
    local temp_file=$(mktemp)
    grep -v "^[[:space:]]*${var_name}:" ecosystem.config.cjs > "$temp_file" 2>/dev/null || true
    mv "$temp_file" ecosystem.config.cjs
}

# Функция для обновления переменной в ecosystem.config.cjs
update_var() {
    local var_name="$1"
    local var_value="$2"
    local search_after="$3"
    
    if [ -z "$var_value" ]; then
        return 0
    fi
    
    local escaped_value
    escaped_value=$(escape_for_sed "$var_value")
    
    # Сначала удаляем все существующие вхождения переменной (включая дубликаты)
    remove_var "$var_name"
    
    # Теперь добавляем переменную один раз после указанной строки
    if grep -q "$search_after" ecosystem.config.cjs 2>/dev/null; then
        # Используем awk для более надежной вставки
        awk -v var="${var_name}" -v val="${escaped_value}" -v after="${search_after}" '
            /'"${search_after}"'/ {
                print
                print "      " var ": '\''" val "'\'',"
                inserted = 1
                next
            }
            { print }
        ' ecosystem.config.cjs > ecosystem.config.cjs.tmp
        mv ecosystem.config.cjs.tmp ecosystem.config.cjs
        echo "  ✓ Обновлен ${var_name}"
    else
        echo "  ⚠️  Не найдена строка '$search_after' для добавления ${var_name}"
    fi
}

# Обновляем переменные по порядку
update_var "DATABASE_URL" "$DATABASE_URL" "NODE_ENV: 'production'"
update_var "NEXTAUTH_URL" "$NEXTAUTH_URL" "DATABASE_URL:"
update_var "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "NEXTAUTH_URL:"
update_var "UPLOADS_DIR" "$UPLOADS_DIR" "NEXTAUTH_SECRET:"

echo "✅ ecosystem.config.cjs обновлен успешно"
