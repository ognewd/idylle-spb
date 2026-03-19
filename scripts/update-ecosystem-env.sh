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

if [ ! -f .env ] && [ ! -f .env.local ]; then
    echo "⚠️  Ни .env, ни .env.local не найдены, пропускаю обновление"
    exit 0
fi

echo "🔧 Обновляю ecosystem.config.cjs с переменными из .env и .env.local..."

# Вспомогательная функция: читает переменную из .env.local (приоритет) → .env
read_env_var() {
    local var_name="$1"
    local val=""
    # Сначала .env
    if [ -f .env ] && grep -q "^${var_name}=" .env 2>/dev/null; then
        val=$(grep "^${var_name}=" .env | head -1 | cut -d'=' -f2- | sed "s/^[\"']//;s/[\"']$//")
    fi
    # .env.local переопределяет
    if [ -f .env.local ] && grep -q "^${var_name}=" .env.local 2>/dev/null; then
        val=$(grep "^${var_name}=" .env.local | head -1 | cut -d'=' -f2- | sed "s/^[\"']//;s/[\"']$//")
    fi
    echo "$val"
}

# Читаем переменные (.env.local имеет приоритет над .env)
DATABASE_URL=$(read_env_var "DATABASE_URL")
NEXTAUTH_URL=$(read_env_var "NEXTAUTH_URL")
NEXTAUTH_SECRET=$(read_env_var "NEXTAUTH_SECRET")
UPLOADS_DIR=$(read_env_var "UPLOADS_DIR")
CDEK_CLIENT_ID=$(read_env_var "CDEK_CLIENT_ID")
CDEK_CLIENT_SECRET=$(read_env_var "CDEK_CLIENT_SECRET")
CDEK_TEST_MODE=$(read_env_var "CDEK_TEST_MODE")
CDEK_API_URL=$(read_env_var "CDEK_API_URL")
CDEK_API_TEST_URL=$(read_env_var "CDEK_API_TEST_URL")
DADATA_API_KEY=$(read_env_var "DADATA_API_KEY")
DADATA_SECRET=$(read_env_var "DADATA_SECRET")

# Проверяем, не является ли DATABASE_URL Supabase (не используем Supabase)
if echo "$DATABASE_URL" | grep -qE "supabase|aws-1-us-east-1\.pooler\.supabase" 2>/dev/null; then
    echo "⚠️  Обнаружен Supabase DATABASE_URL, используем локальный PostgreSQL"
    DB_USER="idylle_user"
    DB_PASSWORD_ENCODED="wendw%40%40422ewd%21"
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@localhost:5432/idylle_spb?schema=public"
    if [ -f .env ] && grep -q "^DATABASE_URL=" .env; then
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env
        echo "  ✓ DATABASE_URL исправлен в .env"
    fi
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

# Обновляем переменные по порядку (каждая добавляется после предыдущей)
update_var "DATABASE_URL" "$DATABASE_URL" "NODE_ENV: 'production'"
update_var "NEXTAUTH_URL" "$NEXTAUTH_URL" "DATABASE_URL:"
update_var "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "NEXTAUTH_URL:"
update_var "UPLOADS_DIR" "$UPLOADS_DIR" "NEXTAUTH_SECRET:"
update_var "CDEK_CLIENT_ID" "$CDEK_CLIENT_ID" "UPLOADS_DIR:"
update_var "CDEK_CLIENT_SECRET" "$CDEK_CLIENT_SECRET" "CDEK_CLIENT_ID:"
update_var "CDEK_TEST_MODE" "$CDEK_TEST_MODE" "CDEK_CLIENT_SECRET:"
update_var "CDEK_API_URL" "$CDEK_API_URL" "CDEK_TEST_MODE:"
update_var "CDEK_API_TEST_URL" "$CDEK_API_TEST_URL" "CDEK_API_URL:"
update_var "DADATA_API_KEY" "$DADATA_API_KEY" "CDEK_API_TEST_URL:"
update_var "DADATA_SECRET" "$DADATA_SECRET" "DADATA_API_KEY:"

echo "✅ ecosystem.config.cjs обновлен успешно"
