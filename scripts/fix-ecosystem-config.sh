#!/bin/bash

# Скрипт для исправления ecosystem.config.cjs на сервере
# Использование: bash scripts/fix-ecosystem-config.sh

set -e

echo "🔧 Исправление ecosystem.config.cjs..."
echo ""

cd /root/idylle-spb || exit 1

# Проверяем наличие файла
if [ ! -f ecosystem.config.cjs ]; then
    echo "📝 Создаю ecosystem.config.cjs из примера..."
    if [ -f ecosystem.config.cjs.example ]; then
        cp ecosystem.config.cjs.example ecosystem.config.cjs
    else
        echo "❌ ecosystem.config.cjs.example не найден!"
        exit 1
    fi
fi

# Проверяем, использует ли он старую конфигурацию (npm start)
if grep -q '"script":\s*"npm"' ecosystem.config.cjs || grep -q "'script':\s*'npm'" ecosystem.config.cjs; then
    echo "🔧 Обнаружена старая конфигурация (npm start)"
    echo "📝 Обновляю на прямой путь к next..."
    
    # Создаем резервную копию
    cp ecosystem.config.cjs ecosystem.config.cjs.backup
    
    # Читаем DATABASE_URL из .env если есть
    if [ -f .env ]; then
        DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    fi
    
    # Создаем новый конфиг
    cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'idylle-spb',
    cwd: '/root/idylle-spb',
    script: '/root/idylle-spb/node_modules/.bin/next',
    args: 'start',
    interpreter: 'node',
    env: {
      NODE_ENV: 'production',
EOF

    # Добавляем DATABASE_URL если он есть
    if [ -n "$DATABASE_URL" ]; then
        echo "      DATABASE_URL: '$DATABASE_URL'," >> ecosystem.config.cjs
    else
        echo "      // DATABASE_URL: 'postgresql://USER:PASSWORD@localhost:5432/DATABASE?schema=public'," >> ecosystem.config.cjs
    fi
    
    # Добавляем остальные переменные из .env
    if [ -f .env ]; then
        grep -E "^(NEXTAUTH_URL|NEXTAUTH_SECRET|NEXT_PUBLIC_BASE_URL|UPLOADS_DIR)=" .env | while IFS='=' read -r key value; do
            value=$(echo "$value" | tr -d '"' | tr -d "'")
            echo "      $key: '$value'," >> ecosystem.config.cjs
        done
    fi
    
    cat >> ecosystem.config.cjs << 'EOF'
    },
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
EOF

    echo "✅ Конфигурация обновлена"
    echo "📋 Проверьте содержимое:"
    echo ""
    cat ecosystem.config.cjs
else
    echo "✅ Конфигурация уже использует правильный путь к next"
fi

# Проверяем наличие next
if [ ! -f node_modules/.bin/next ]; then
    echo ""
    echo "⚠️  next не найден, устанавливаю зависимости..."
    npm ci --prefer-offline --no-audit || npm install --no-audit
fi

# Перезапускаем PM2
echo ""
echo "🔄 Перезапуск PM2 с новой конфигурацией..."
pm2 delete idylle-spb 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "✅ Готово!"
echo "📋 Проверьте статус: pm2 status"
