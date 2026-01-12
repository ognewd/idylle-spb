#!/bin/bash

# Скрипт проверки продакшен окружения после деплоя

set -e

echo "🔍 Проверка продакшен окружения..."
echo ""

ERRORS=0
WARNINGS=0

# 1. Проверка переменных окружения
echo "1️⃣  Проверка переменных окружения..."
cd /root/idylle-spb || exit 1

REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "NEXT_PUBLIC_BASE_URL" "UPLOADS_DIR")

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null; then
        echo "  ✅ $var установлена"
    else
        echo "  ❌ $var НЕ установлена!"
        ((ERRORS++))
    fi
done

echo ""

# 2. Проверка директории загрузок
echo "2️⃣  Проверка директории загрузок..."
UPLOADS_DIR=$(grep "^UPLOADS_DIR=" .env | cut -d'=' -f2 || echo "")

if [ -z "$UPLOADS_DIR" ]; then
    echo "  ❌ UPLOADS_DIR не установлена в .env"
    ((ERRORS++))
else
    PRODUCTS_DIR="$UPLOADS_DIR/products"
    
    if [ -d "$PRODUCTS_DIR" ]; then
        echo "  ✅ Директория существует: $PRODUCTS_DIR"
        
        # Проверка прав
        OWNER=$(stat -c '%U:%G' "$PRODUCTS_DIR" 2>/dev/null || stat -f '%Su:%Sg' "$PRODUCTS_DIR" 2>/dev/null || echo "unknown")
        if [[ "$OWNER" == *"www-data"* ]] || [[ "$OWNER" == *"root"* ]]; then
            echo "  ✅ Права доступа правильные: $OWNER"
        else
            echo "  ⚠️  Неправильные права доступа: $OWNER (должно быть www-data:www-data)"
            ((WARNINGS++))
        fi
    else
        echo "  ❌ Директория не существует: $PRODUCTS_DIR"
        ((ERRORS++))
    fi
fi

echo ""

# 3. Проверка Nginx
echo "3️⃣  Проверка Nginx конфигурации..."
if grep -q "location /uploads/" /etc/nginx/sites-enabled/aromarussia.ru 2>/dev/null; then
    echo "  ✅ Nginx настроен для /uploads/"
else
    echo "  ⚠️  Nginx не настроен для /uploads/"
    ((WARNINGS++))
fi

echo ""

# 4. Проверка PM2
echo "4️⃣  Проверка PM2..."
if pm2 list | grep -q "idylle-spb.*online"; then
    echo "  ✅ PM2 процесс запущен"
    
    # Проверка последних ошибок
    if pm2 logs idylle-spb --lines 50 --nostream 2>/dev/null | grep -qi "error.*upload\|error.*UPLOADS_DIR\|permission denied.*upload"; then
        echo "  ⚠️  Обнаружены ошибки, связанные с загрузками в логах"
        ((WARNINGS++))
    fi
else
    echo "  ❌ PM2 процесс не запущен!"
    ((ERRORS++))
fi

echo ""

# 5. Проверка .next директории
echo "5️⃣  Проверка сборки..."
if [ -d ".next" ]; then
    echo "  ✅ Директория .next существует"
    if [ -f ".next/BUILD_ID" ]; then
        echo "  ✅ BUILD_ID найден - сборка завершена"
    else
        echo "  ⚠️  BUILD_ID не найден - возможно, сборка не завершена"
        ((WARNINGS++))
    fi
else
    echo "  ❌ Директория .next не существует - приложение не собрано!"
    ((ERRORS++))
fi

echo ""

# Итоги
echo "════════════════════════════════════════"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Все проверки пройдены успешно!"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Есть предупреждения ($WARNINGS), но критических ошибок нет"
    exit 0
else
    echo "❌ Обнаружено ошибок: $ERRORS"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  Предупреждений: $WARNINGS"
    fi
    echo ""
    echo "Исправьте ошибки перед использованием приложения!"
    exit 1
fi

