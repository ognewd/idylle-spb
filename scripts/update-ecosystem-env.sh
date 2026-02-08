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

# Создаем резервную копию
cp ecosystem.config.cjs ecosystem.config.cjs.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Используем Node.js скрипт для обновления
node << 'NODE_SCRIPT'
const fs = require('fs');
const path = require('path');

// Читаем переменные из окружения (передаются через process.env)
const envVars = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  UPLOADS_DIR: process.env.UPLOADS_DIR || '',
};

const configPath = path.join(process.cwd(), 'ecosystem.config.cjs');
let configContent = fs.readFileSync(configPath, 'utf8');

// Функция для экранирования одинарных кавычек
function escapeSingleQuotes(str) {
  return str.replace(/'/g, "\\'");
}

// Обновляем или добавляем каждую переменную
Object.entries(envVars).forEach(([key, value]) => {
  if (!value) return; // Пропускаем пустые значения
  
  const escapedValue = escapeSingleQuotes(value);
  const regex = new RegExp(`${key}:\\s*['"'"'"]?[^'"'"'",]*`, 'g');
  
  if (regex.test(configContent)) {
    // Заменяем существующее значение
    configContent = configContent.replace(regex, `${key}: '${escapedValue}'`);
  } else {
    // Добавляем новую переменную после NODE_ENV или после последней переменной env
    const nodeEnvMatch = configContent.match(/NODE_ENV:\s*['"'"'"]production['"'"'"],?/);
    if (nodeEnvMatch) {
      configContent = configContent.replace(
        nodeEnvMatch[0],
        `${nodeEnvMatch[0]}\n      ${key}: '${escapedValue}',`
      );
    } else {
      // Если NODE_ENV не найден, добавляем перед закрывающей скобкой env
      configContent = configContent.replace(
        /(\s+)(},)/,
        `$1${key}: '${escapedValue}',\n$1$2`
      );
    }
  }
});

fs.writeFileSync(configPath, configContent, 'utf8');
console.log('✅ ecosystem.config.cjs обновлен');
NODE_SCRIPT

# Передаем переменные в Node.js скрипт через окружение
export DATABASE_URL NEXTAUTH_URL NEXTAUTH_SECRET UPLOADS_DIR

# Запускаем Node.js скрипт с переменными окружения
node -e "
const fs = require('fs');
const path = require('path');

const envVars = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  UPLOADS_DIR: process.env.UPLOADS_DIR || '',
};

const configPath = path.join(process.cwd(), 'ecosystem.config.cjs');
let configContent = fs.readFileSync(configPath, 'utf8');

function escapeSingleQuotes(str) {
  return str.replace(/'/g, \"\\\\'\");
}

Object.entries(envVars).forEach(([key, value]) => {
  if (!value) return;
  
  const escapedValue = escapeSingleQuotes(value);
  const regex = new RegExp(\`\${key}:\\\\s*['\\\"']?[^'\\\",]*\`, 'g');
  
  if (regex.test(configContent)) {
    configContent = configContent.replace(regex, \`\${key}: '\${escapedValue}'\`);
  } else {
    const nodeEnvMatch = configContent.match(/NODE_ENV:\\\\s*['\\\"]production['\\\"],?/);
    if (nodeEnvMatch) {
      configContent = configContent.replace(
        nodeEnvMatch[0],
        \`\${nodeEnvMatch[0]}\\\\n      \${key}: '\${escapedValue}',\`
      );
    } else {
      configContent = configContent.replace(
        /(\\\\s+)(},)/,
        \`\$1\${key}: '\${escapedValue}',\\\\n\$1\$2\`
      );
    }
  }
});

fs.writeFileSync(configPath, configContent, 'utf8');
console.log('✅ ecosystem.config.cjs обновлен');
" || {
    echo "⚠️  Ошибка при обновлении через Node.js, пробую простой подход с sed..."
    
    # Простой подход с sed для критичных переменных
    if [ -n "$DATABASE_URL" ]; then
        if grep -q "DATABASE_URL:" ecosystem.config.cjs; then
            # Заменяем существующее значение
            sed -i "s|DATABASE_URL:.*|DATABASE_URL: '$(echo "$DATABASE_URL" | sed "s/'/\\\\'/g")',|g" ecosystem.config.cjs
        else
            # Добавляем после NODE_ENV
            sed -i "/NODE_ENV: 'production',/a\      DATABASE_URL: '$(echo "$DATABASE_URL" | sed "s/'/\\\\'/g")'," ecosystem.config.cjs
        fi
    fi
}

echo "✅ Готово! Проверьте ecosystem.config.cjs"
