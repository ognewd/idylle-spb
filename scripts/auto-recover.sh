#!/bin/bash

# Скрипт автоматического восстановления приложения
# Проверяет здоровье и восстанавливает при необходимости

set -e

echo "🔧 Автоматическое восстановление приложения..."
echo "⏱️  Время: $(date)"

cd /root/idylle-spb || { echo "❌ Директория не найдена!"; exit 1; }

# Запускаем проверку здоровья
if ./scripts/health-check.sh > /tmp/health-check.log 2>&1; then
    echo "✅ Приложение работает нормально, восстановление не требуется"
    exit 0
fi

echo "⚠️  Обнаружены проблемы, начинаю восстановление..."

# Проблема 1: Отсутствует BUILD_ID
if [ ! -f .next/BUILD_ID ]; then
    echo "🔨 Проблема: отсутствует BUILD_ID, запускаю сборку..."
    
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
    # Очищаем и собираем
    rm -rf .next node_modules/.cache
    npm run build
    
    if [ ! -f .next/BUILD_ID ]; then
        echo "❌ Ошибка: сборка не удалась!"
        exit 1
    fi
    
    echo "✅ Сборка завершена успешно"
fi

# Проблема 2: PM2 не запущен или упал
if ! pm2 list | grep -q "idylle-spb.*online"; then
    echo "🔄 Проблема: PM2 не запущен, перезапускаю..."
    
    if pm2 list | grep -q "idylle-spb"; then
        pm2 restart idylle-spb --update-env
    else
        if [ -f ecosystem.config.js ]; then
            pm2 start ecosystem.config.js
        else
            pm2 start npm --name "idylle-spb" -- start
        fi
    fi
    
    sleep 5
    
    if ! pm2 list | grep -q "idylle-spb.*online"; then
        echo "❌ Ошибка: не удалось запустить PM2!"
        exit 1
    fi
    
    echo "✅ PM2 запущен"
fi

# Финальная проверка
echo ""
echo "🔍 Финальная проверка..."
if ./scripts/health-check.sh; then
    echo "✅ Восстановление завершено успешно!"
    exit 0
else
    echo "❌ Восстановление не удалось, требуется ручное вмешательство"
    exit 1
fi
