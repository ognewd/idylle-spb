#!/bin/bash

# Скрипт для исправления проблемы "next: not found" в PM2
# Использование: bash scripts/fix-pm2-next-not-found.sh

set -e

echo "🔧 Исправление проблемы 'next: not found' в PM2..."
echo ""

cd /root/idylle-spb || exit 1

# 1. Проверка и установка зависимостей
echo "1️⃣  Проверка зависимостей..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/next" ]; then
    echo "  ⚠️  Зависимости отсутствуют или повреждены"
    echo "  📦 Устанавливаю зависимости..."
    npm ci --prefer-offline --no-audit
else
    echo "  ✅ Зависимости установлены"
fi

# 2. Проверка наличия next
echo ""
echo "2️⃣  Проверка наличия next..."
if [ -f "node_modules/.bin/next" ]; then
    NEXT_PATH=$(readlink -f node_modules/.bin/next || echo "node_modules/.bin/next")
    echo "  ✅ next найден: $NEXT_PATH"
else
    echo "  ❌ next не найден!"
    echo "  📦 Переустанавливаю зависимости..."
    rm -rf node_modules
    npm ci --prefer-offline --no-audit
    if [ ! -f "node_modules/.bin/next" ]; then
        echo "  ❌ Ошибка: next все еще не найден после переустановки!"
        exit 1
    fi
fi

# 3. Проверка ecosystem.config.cjs
echo ""
echo "3️⃣  Проверка конфигурации PM2..."
if [ -f "ecosystem.config.cjs" ]; then
    echo "  ✅ ecosystem.config.cjs найден"
    # Проверяем, использует ли он правильный путь
    if grep -q "node_modules/.bin/next" ecosystem.config.cjs || grep -q "path.join" ecosystem.config.cjs; then
        echo "  ✅ Конфигурация использует правильный путь к next"
    else
        echo "  ⚠️  Конфигурация может использовать неправильный путь"
        echo "  💡 Обновите ecosystem.config.cjs из ecosystem.config.cjs.example"
    fi
else
    echo "  ⚠️  ecosystem.config.cjs не найден"
    if [ -f "ecosystem.config.cjs.example" ]; then
        echo "  📝 Создаю ecosystem.config.cjs из примера..."
        cp ecosystem.config.cjs.example ecosystem.config.cjs
        echo "  ⚠️  ВАЖНО: Отредактируйте ecosystem.config.cjs с правильными переменными окружения!"
    fi
fi

# 4. Остановка и перезапуск PM2
echo ""
echo "4️⃣  Перезапуск PM2..."
pm2 delete idylle-spb 2>/dev/null || true

if [ -f "ecosystem.config.cjs" ]; then
    echo "  ▶️  Запуск через ecosystem.config.cjs..."
    pm2 start ecosystem.config.cjs
else
    echo "  ▶️  Запуск через прямой путь к next..."
    pm2 start node_modules/.bin/next --name idylle-spb -- start --update-env
fi

# 5. Проверка статуса
echo ""
echo "5️⃣  Проверка статуса..."
sleep 2
pm2 status

# 6. Проверка логов
echo ""
echo "6️⃣  Проверка логов (последние 20 строк):"
pm2 logs idylle-spb --lines 20 --nostream || echo "  ⚠️  Не удалось получить логи"

# 7. Проверка, что next запущен
echo ""
echo "7️⃣  Проверка процесса..."
if pm2 list | grep -q "idylle-spb.*online"; then
    echo "  ✅ Приложение запущено успешно!"
else
    echo "  ❌ Приложение не запущено или в состоянии ошибки"
    echo "  📋 Детальные логи:"
    pm2 logs idylle-spb --lines 50 --nostream
    exit 1
fi

echo ""
echo "✅ Исправление завершено!"
echo ""
echo "📝 Если проблемы остались:"
echo "  1. Проверьте логи: pm2 logs idylle-spb --lines 50"
echo "  2. Проверьте конфигурацию: cat ecosystem.config.cjs"
echo "  3. Проверьте зависимости: ls -la node_modules/.bin/ | grep next"
