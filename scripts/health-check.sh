#!/bin/bash

# Скрипт проверки здоровья приложения
# Проверяет наличие билда, работу PM2 и доступность сайта

set -e

echo "🏥 Проверка здоровья приложения..."

cd /root/idylle-spb || { echo "❌ Директория не найдена!"; exit 1; }

ERRORS=0

# Проверка 1: Наличие BUILD_ID
echo ""
echo "1️⃣  Проверка наличия билда..."
if [ ! -f .next/BUILD_ID ]; then
    echo "❌ ОШИБКА: .next/BUILD_ID не найден! Приложение не собрано."
    ERRORS=$((ERRORS + 1))
else
    BUILD_ID=$(cat .next/BUILD_ID)
    echo "✅ BUILD_ID найден: $BUILD_ID"
fi

# Проверка 2: Статус PM2
echo ""
echo "2️⃣  Проверка статуса PM2..."
if ! pm2 list | grep -q "idylle-spb.*online"; then
    echo "❌ ОШИБКА: Приложение не запущено в PM2 или не в статусе 'online'"
    pm2 status
    ERRORS=$((ERRORS + 1))
else
    echo "✅ PM2: приложение запущено"
    pm2 list | grep idylle-spb
fi

# Проверка 3: Порт 3000
echo ""
echo "3️⃣  Проверка порта 3000..."
if ! (netstat -tlnp 2>/dev/null | grep -q ":3000" || ss -tlnp 2>/dev/null | grep -q ":3000"); then
    echo "❌ ОШИБКА: Порт 3000 не слушается"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Порт 3000 слушается"
fi

# Проверка 4: HTTP ответ
echo ""
echo "4️⃣  Проверка HTTP ответа..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "000" ]; then
    echo "⚠️  Предупреждение: HTTP код $HTTP_CODE (ожидался 200)"
elif [ "$HTTP_CODE" == "000" ]; then
    echo "❌ ОШИБКА: Не удалось подключиться к localhost:3000"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ HTTP ответ: $HTTP_CODE"
fi

# Проверка 5: Логи без критических ошибок
echo ""
echo "5️⃣  Проверка логов на критические ошибки..."
if pm2 logs idylle-spb --lines 50 --nostream 2>&1 | grep -iE "error|fatal|cannot|ENOENT.*BUILD_ID" | grep -v "Dynamic server usage" | head -5; then
    echo "⚠️  Обнаружены ошибки в логах (проверьте выше)"
    # Не считаем это критической ошибкой, если приложение работает
else
    echo "✅ Критических ошибок в логах не обнаружено"
fi

# Итоговый результат
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Все проверки пройдены! Приложение работает нормально."
    exit 0
else
    echo "❌ Обнаружено ошибок: $ERRORS"
    echo ""
    echo "🔧 Рекомендуемые действия:"
    if [ ! -f .next/BUILD_ID ]; then
        echo "   1. Запустите: cd /root/idylle-spb && npm run build"
    fi
    if ! pm2 list | grep -q "idylle-spb.*online"; then
        echo "   2. Запустите: pm2 restart idylle-spb"
    fi
    echo "   3. Проверьте логи: pm2 logs idylle-spb --lines 50"
    exit 1
fi
