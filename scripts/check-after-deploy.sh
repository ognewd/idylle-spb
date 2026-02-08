#!/bin/bash

# Скрипт быстрой проверки после деплоя
# Использование: bash scripts/check-after-deploy.sh

set -e

echo "🔍 Проверка после деплоя..."
echo ""

cd /root/idylle-spb || exit 1

# 1. Проверка переменных окружения
echo "1️⃣  Проверка переменных окружения..."
if grep -q "^UPLOADS_DIR=" .env 2>/dev/null; then
    UPLOADS_DIR=$(grep "^UPLOADS_DIR=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    echo "  ✅ UPLOADS_DIR: $UPLOADS_DIR"
else
    echo "  ❌ UPLOADS_DIR не установлена!"
    echo "  💡 Запустите: bash scripts/fix-uploads-location.sh"
fi

# 2. Проверка директории
echo ""
echo "2️⃣  Проверка директории загрузок..."
if [ -n "$UPLOADS_DIR" ]; then
    PRODUCTS_DIR="$UPLOADS_DIR/products"
    if [ -d "$PRODUCTS_DIR" ]; then
        FILE_COUNT=$(find "$PRODUCTS_DIR" -type f 2>/dev/null | wc -l)
        echo "  ✅ Директория существует: $PRODUCTS_DIR"
        echo "  📁 Файлов в директории: $FILE_COUNT"
        
        if [ "$FILE_COUNT" -gt 0 ]; then
            echo "  📋 Примеры файлов:"
            ls -lh "$PRODUCTS_DIR" | head -5 | tail -4
        fi
    else
        echo "  ❌ Директория не существует: $PRODUCTS_DIR"
    fi
fi

# 3. Проверка PM2
echo ""
echo "3️⃣  Проверка PM2..."
if pm2 list | grep -q "idylle-spb"; then
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="idylle-spb") | .pm2_env.status' 2>/dev/null || echo "unknown")
    echo "  ✅ Приложение запущено, статус: $STATUS"
    
    # Проверка последних логов на ошибки
    echo ""
    echo "  📋 Последние логи (последние 10 строк):"
    pm2 logs idylle-spb --lines 10 --nostream 2>/dev/null | tail -10 || echo "  ⚠️  Не удалось получить логи"
else
    echo "  ❌ Приложение не запущено!"
fi

# 4. Проверка Nginx
echo ""
echo "4️⃣  Проверка Nginx..."
if grep -q "location /uploads/" /etc/nginx/sites-enabled/aromarussia.ru 2>/dev/null; then
    echo "  ✅ Nginx настроен для /uploads/"
    echo "  📋 Конфигурация:"
    grep -A 3 "location /uploads/" /etc/nginx/sites-enabled/aromarussia.ru | head -4
else
    echo "  ❌ Nginx НЕ настроен для /uploads/"
    echo "  💡 Добавьте в конфиг Nginx блок location /uploads/"
fi

# 5. Проверка доступности через HTTP
echo ""
echo "5️⃣  Проверка доступности..."
if [ -n "$UPLOADS_DIR" ] && [ -d "$UPLOADS_DIR/products" ]; then
    # Берем первый файл для теста
    TEST_FILE=$(find "$UPLOADS_DIR/products" -type f -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" 2>/dev/null | head -1)
    if [ -n "$TEST_FILE" ]; then
        FILENAME=$(basename "$TEST_FILE")
        TEST_URL="https://aromarussia.ru/uploads/products/$FILENAME"
        echo "  🔗 Тестовый URL: $TEST_URL"
        echo "  💡 Откройте этот URL в браузере для проверки"
    else
        echo "  ⚠️  Нет файлов для тестирования"
    fi
fi

echo ""
echo "✅ Проверка завершена!"
echo ""
echo "📝 Если есть проблемы:"
echo "  1. Запустите: bash scripts/fix-uploads-location.sh"
echo "  2. Проверьте логи: pm2 logs idylle-spb --lines 50"
echo "  3. См. инструкцию: cat FIX_IMAGE_UPLOADS.md"
