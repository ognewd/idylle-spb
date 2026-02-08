#!/bin/bash

# Скрипт для обновления ecosystem.config.cjs с переменными из .env
# Использование: bash scripts/update-ecosystem-env.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

if [ ! -f ecosystem.config.cjs ]; then
    echo "❌ ecosystem.config.cjs не найден!"
    exit 1
fi

if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден, пропускаю обновление"
    exit 0
fi

echo "🔧 Обновляю ecosystem.config.cjs с переменными из .env..."

# Читаем переменные из .env
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1)
NEXTAUTH_URL=$(grep "^NEXTAUTH_URL=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1)
NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1)
UPLOADS_DIR=$(grep "^UPLOADS_DIR=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1)

# Функция для экранирования одинарных кавычек в sed
escape_sed() {
    echo "$1" | sed "s/'/'\"'\"'/g"
}

# Обновляем DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
    ESCAPED_DB_URL=$(escape_sed "$DATABASE_URL")
    if grep -q "DATABASE_URL:" ecosystem.config.cjs; then
        sed -i "s|DATABASE_URL:.*|DATABASE_URL: '$ESCAPED_DB_URL',|g" ecosystem.config.cjs
        echo "  ✓ Обновлен DATABASE_URL"
    else
        sed -i "/NODE_ENV: 'production',/a\      DATABASE_URL: '$ESCAPED_DB_URL'," ecosystem.config.cjs
        echo "  ✓ Добавлен DATABASE_URL"
    fi
fi

# Обновляем NEXTAUTH_URL
if [ -n "$NEXTAUTH_URL" ]; then
    ESCAPED_NEXTAUTH_URL=$(escape_sed "$NEXTAUTH_URL")
    if grep -q "NEXTAUTH_URL:" ecosystem.config.cjs; then
        sed -i "s|NEXTAUTH_URL:.*|NEXTAUTH_URL: '$ESCAPED_NEXTAUTH_URL',|g" ecosystem.config.cjs
        echo "  ✓ Обновлен NEXTAUTH_URL"
    else
        sed -i "/DATABASE_URL:/a\      NEXTAUTH_URL: '$ESCAPED_NEXTAUTH_URL'," ecosystem.config.cjs
        echo "  ✓ Добавлен NEXTAUTH_URL"
    fi
fi

# Обновляем NEXTAUTH_SECRET
if [ -n "$NEXTAUTH_SECRET" ]; then
    ESCAPED_NEXTAUTH_SECRET=$(escape_sed "$NEXTAUTH_SECRET")
    if grep -q "NEXTAUTH_SECRET:" ecosystem.config.cjs; then
        sed -i "s|NEXTAUTH_SECRET:.*|NEXTAUTH_SECRET: '$ESCAPED_NEXTAUTH_SECRET',|g" ecosystem.config.cjs
        echo "  ✓ Обновлен NEXTAUTH_SECRET"
    else
        sed -i "/NEXTAUTH_URL:/a\      NEXTAUTH_SECRET: '$ESCAPED_NEXTAUTH_SECRET'," ecosystem.config.cjs
        echo "  ✓ Добавлен NEXTAUTH_SECRET"
    fi
fi

# Обновляем UPLOADS_DIR
if [ -n "$UPLOADS_DIR" ]; then
    ESCAPED_UPLOADS_DIR=$(escape_sed "$UPLOADS_DIR")
    if grep -q "UPLOADS_DIR:" ecosystem.config.cjs; then
        sed -i "s|UPLOADS_DIR:.*|UPLOADS_DIR: '$ESCAPED_UPLOADS_DIR',|g" ecosystem.config.cjs
        echo "  ✓ Обновлен UPLOADS_DIR"
    else
        sed -i "/NEXTAUTH_SECRET:/a\      UPLOADS_DIR: '$ESCAPED_UPLOADS_DIR'," ecosystem.config.cjs
        echo "  ✓ Добавлен UPLOADS_DIR"
    fi
fi

echo "✅ ecosystem.config.cjs обновлен успешно"
