#!/bin/bash

# Скрипт для обновления ecosystem.config.cjs с переменными из .env
# Использование: bash scripts/update-ecosystem-env.sh

set -e

cd /root/idylle-spb || exit 1

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
NEXT_PUBLIC_BASE_URL=$(grep "^NEXT_PUBLIC_BASE_URL=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1)
UPLOADS_DIR=$(grep "^UPLOADS_DIR=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1)

# Создаем резервную копию
cp ecosystem.config.cjs ecosystem.config.cjs.backup.$(date +%Y%m%d_%H%M%S)

# Используем Node.js для более надежного обновления JSON-подобного файла
node << EOF
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'ecosystem.config.cjs');
let configContent = fs.readFileSync(configPath, 'utf8');

// Функция для экранирования специальных символов в строках
function escapeForRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
}

// Обновляем или добавляем DATABASE_URL
if ('${DATABASE_URL}') {
    const dbUrlRegex = /DATABASE_URL:\s*['"'"'"]?[^'"'"'",]*/;
    if (dbUrlRegex.test(configContent)) {
        configContent = configContent.replace(dbUrlRegex, \`DATABASE_URL: '\${'${DATABASE_URL}'.replace(/'/g, "\\\\'")}'\`);
    } else {
        // Добавляем после NODE_ENV
        configContent = configContent.replace(
            /(NODE_ENV:\s*['"'"'"]production['"'"'"],?)/,
            \`\$1\n      DATABASE_URL: '\${'${DATABASE_URL}'.replace(/'/g, "\\\\'")}',\`
        );
    }
}

// Обновляем или добавляем NEXTAUTH_URL
if ('${NEXTAUTH_URL}') {
    const nextAuthUrlRegex = /NEXTAUTH_URL:\s*['"'"'"]?[^'"'"'",]*/;
    if (nextAuthUrlRegex.test(configContent)) {
        configContent = configContent.replace(nextAuthUrlRegex, \`NEXTAUTH_URL: '\${'${NEXTAUTH_URL}'.replace(/'/g, "\\\\'")}'\`);
    } else {
        configContent = configContent.replace(
            /(DATABASE_URL:\s*['"'"'"][^'"'"'"]*['"'"'"],?)/,
            \`\$1\n      NEXTAUTH_URL: '\${'${NEXTAUTH_URL}'.replace(/'/g, "\\\\'")}',\`
        );
    }
}

// Обновляем или добавляем NEXTAUTH_SECRET
if ('${NEXTAUTH_SECRET}') {
    const nextAuthSecretRegex = /NEXTAUTH_SECRET:\s*['"'"'"]?[^'"'"'",]*/;
    if (nextAuthSecretRegex.test(configContent)) {
        configContent = configContent.replace(nextAuthSecretRegex, \`NEXTAUTH_SECRET: '\${'${NEXTAUTH_SECRET}'.replace(/'/g, "\\\\'")}'\`);
    } else {
        configContent = configContent.replace(
            /(NEXTAUTH_URL:\s*['"'"'"][^'"'"'"]*['"'"'"],?)/,
            \`\$1\n      NEXTAUTH_SECRET: '\${'${NEXTAUTH_SECRET}'.replace(/'/g, "\\\\'")}',\`
        );
    }
}

// Обновляем или добавляем UPLOADS_DIR
if ('${UPLOADS_DIR}') {
    const uploadsDirRegex = /UPLOADS_DIR:\s*['"'"'"]?[^'"'"'",]*/;
    if (uploadsDirRegex.test(configContent)) {
        configContent = configContent.replace(uploadsDirRegex, \`UPLOADS_DIR: '\${'${UPLOADS_DIR}'.replace(/'/g, "\\\\'")}'\`);
    } else {
        configContent = configContent.replace(
            /(NEXTAUTH_SECRET:\s*['"'"'"][^'"'"'"]*['"'"'"],?)/,
            \`\$1\n      UPLOADS_DIR: '\${'${UPLOADS_DIR}'.replace(/'/g, "\\\\'")}',\`
        );
    }
}

fs.writeFileSync(configPath, configContent, 'utf8');
console.log('✅ ecosystem.config.cjs обновлен');
EOF

echo "✅ Готово! Проверьте ecosystem.config.cjs"
