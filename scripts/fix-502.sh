#!/bin/bash

# Скрипт для исправления ошибки 502 Bad Gateway
# Использование: bash scripts/fix-502.sh

set -e

echo "🔧 Исправление ошибки 502 Bad Gateway..."
echo ""

cd /root/idylle-spb || exit 1

# 1. Проверка статуса PM2
echo "1️⃣  Проверка статуса PM2..."
pm2 status

# 2. Проверка логов
echo ""
echo "2️⃣  Проверка последних логов (20 строк)..."
pm2 logs idylle-spb --lines 20 --nostream || echo "⚠️  Не удалось получить логи"

# 3. Проверка порта 3000
echo ""
echo "3️⃣  Проверка порта 3000..."
if ss -tlnp 2>/dev/null | grep -q ":3000" || netstat -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "  ✅ Порт 3000 слушается"
    ss -tlnp | grep 3000 || netstat -tlnp | grep 3000
else
    echo "  ❌ Порт 3000 НЕ слушается - приложение не запущено!"
fi

# 4. Проверка локального ответа
echo ""
echo "4️⃣  Проверка локального ответа..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/brands 2>/dev/null || echo "000")
if [ "$HTTP_CODE" == "200" ]; then
    echo "  ✅ Приложение отвечает (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" == "000" ]; then
    echo "  ❌ Не удалось подключиться к localhost:3000"
else
    echo "  ⚠️  HTTP код: $HTTP_CODE"
fi

# 5. Попытка исправления
echo ""
echo "5️⃣  Попытка исправления..."

# Проверяем, запущено ли приложение
if pm2 list | grep -q "idylle-spb.*online"; then
    echo "  ℹ️  Приложение запущено, но возможно есть проблемы"
    echo "  🔄 Перезапускаю приложение..."
    pm2 restart idylle-spb --update-env
elif pm2 list | grep -q "idylle-spb"; then
    echo "  ⚠️  Приложение в статусе ошибки"
    echo "  🔄 Перезапускаю приложение..."
    pm2 restart idylle-spb --update-env
else
    echo "  ❌ Приложение не запущено"
    echo "  ▶️  Запускаю приложение..."
    
    if [ -f ecosystem.config.cjs ]; then
        pm2 start ecosystem.config.cjs
    elif [ -f node_modules/.bin/next ]; then
        pm2 start node_modules/.bin/next --name idylle-spb -- start --update-env
    else
        echo "  ❌ Не найден способ запуска приложения!"
        exit 1
    fi
fi

# Ждем немного
sleep 3

# 6. Повторная проверка
echo ""
echo "6️⃣  Повторная проверка..."
pm2 status

echo ""
echo "7️⃣  Проверка порта 3000 после перезапуска..."
if ss -tlnp 2>/dev/null | grep -q ":3000" || netstat -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "  ✅ Порт 3000 теперь слушается"
else
    echo "  ❌ Порт 3000 все еще не слушается"
    echo "  📋 Последние логи:"
    pm2 logs idylle-spb --lines 30 --nostream
fi

echo ""
echo "✅ Проверка завершена!"
echo ""
echo "📝 Если проблема осталась:"
echo "  1. Проверьте логи: pm2 logs idylle-spb --lines 50"
echo "  2. Проверьте Nginx: tail -20 /var/log/nginx/error.log"
echo "  3. Проверьте базу данных: systemctl status postgresql"
