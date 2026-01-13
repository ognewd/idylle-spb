#!/bin/bash

# Скрипт для быстрого восстановления работы сайта

set -e

echo "🔧 Быстрое восстановление сайта..."

cd /root/idylle-spb || { echo "❌ Директория /root/idylle-spb не найдена!"; exit 1; }

# Проверяем статус PM2
echo "📊 Проверка статуса PM2..."
pm2 status || echo "⚠️  PM2 не запущен"

# Проверяем, запущен ли процесс
if pm2 list | grep -q "idylle-spb"; then
    echo "🔄 Перезапускаем существующий процесс..."
    pm2 restart idylle-spb --update-env
else
    echo "▶️  Запускаем новое приложение..."
    # Проверяем наличие ecosystem.config.js или package.json
    if [ -f ecosystem.config.js ]; then
        pm2 start ecosystem.config.js
    elif [ -f package.json ]; then
        pm2 start npm --name "idylle-spb" -- start
    else
        echo "❌ Не найден конфиг для запуска!"
        exit 1
    fi
fi

# Ждем немного
sleep 2

# Проверяем статус
echo ""
echo "📊 Статус приложения:"
pm2 status

# Показываем последние логи
echo ""
echo "📋 Последние логи (20 строк):"
pm2 logs idylle-spb --lines 20 --nostream || echo "⚠️  Не удалось получить логи"

# Проверяем, слушает ли порт 3000
echo ""
echo "🔍 Проверка порта 3000:"
if netstat -tlnp 2>/dev/null | grep -q ":3000" || ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "✅ Порт 3000 слушается"
else
    echo "⚠️  Порт 3000 не слушается - возможно приложение не запустилось"
fi

echo ""
echo "✅ Скрипт завершен. Проверьте статус выше."

