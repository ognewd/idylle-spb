#!/bin/bash

# Скрипт для обновления ecosystem.config.cjs с переменными из .env
# Использование: bash scripts/update-ecosystem-env.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

# Определяем команду sed в зависимости от ОС
if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_INPLACE="sed -i ''"
else
    SED_INPLACE="sed -i"
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

# Читаем переменные из .env (с обработкой ошибок)
DATABASE_URL=$(grep "^DATABASE_URL=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1 || echo "")
NEXTAUTH_URL=$(grep "^NEXTAUTH_URL=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1 || echo "")
NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1 || echo "")
UPLOADS_DIR=$(grep "^UPLOADS_DIR=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1 || echo "")

# Функция для безопасного экранирования одинарных кавычек для sed
escape_sed() {
    local value="$1"
    # Экранируем одинарные кавычки: ' -> '\''
    echo "$value" | sed "s/'/'\"'\"'/g"
}

# Функция для обновления или добавления переменной
update_env_var() {
    local var_name="$1"
    local var_value="$2"
    local after_line="$3"
    
    if [ -z "$var_value" ]; then
        return 0
    fi
    
    local escaped_value
    escaped_value=$(escape_sed "$var_value")
    
    if grep -q "^[[:space:]]*${var_name}:" ecosystem.config.cjs 2>/dev/null; then
        # Переменная существует, обновляем её
        if $SED_INPLACE "s|^[[:space:]]*${var_name}:.*|      ${var_name}: '${escaped_value}',|g" ecosystem.config.cjs 2>/dev/null; then
            echo "  ✓ Обновлен ${var_name}"
        else
            echo "  ⚠️  Не удалось обновить ${var_name}"
            return 1
        fi
    else
        # Переменная не существует, добавляем после указанной строки
        if grep -q "$after_line" ecosystem.config.cjs 2>/dev/null; then
            if $SED_INPLACE "/${after_line}/a\\
      ${var_name}: '${escaped_value}'," ecosystem.config.cjs 2>/dev/null; then
                echo "  ✓ Добавлен ${var_name}"
            else
                echo "  ⚠️  Не удалось добавить ${var_name}"
                return 1
            fi
        else
            echo "  ⚠️  Не найдена строка '$after_line' для добавления ${var_name}"
            return 1
        fi
    fi
    return 0
}

# Обновляем переменные по порядку
ERRORS=0

if ! update_env_var "DATABASE_URL" "$DATABASE_URL" "NODE_ENV: 'production'"; then
    ERRORS=$((ERRORS + 1))
fi

if ! update_env_var "NEXTAUTH_URL" "$NEXTAUTH_URL" "DATABASE_URL:"; then
    ERRORS=$((ERRORS + 1))
fi

if ! update_env_var "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "NEXTAUTH_URL:"; then
    ERRORS=$((ERRORS + 1))
fi

if ! update_env_var "UPLOADS_DIR" "$UPLOADS_DIR" "NEXTAUTH_SECRET:"; then
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo "✅ ecosystem.config.cjs обновлен успешно"
    exit 0
else
    echo "⚠️  Обновление завершено с $ERRORS ошибками"
    exit 0  # Не прерываем деплой из-за ошибок обновления переменных
fi
