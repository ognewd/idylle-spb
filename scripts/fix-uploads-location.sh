#!/bin/bash

# Скрипт для исправления расположения файлов загрузок на продакшене
# Проверяет, где находятся файлы и перемещает их в правильное место

set -e

echo "🔍 Проверка расположения файлов загрузок..."
echo ""

cd /root/idylle-spb || exit 1

# 1. Проверяем переменную UPLOADS_DIR
echo "1️⃣  Проверка переменной UPLOADS_DIR..."
if grep -q "^UPLOADS_DIR=" .env 2>/dev/null; then
    UPLOADS_DIR=$(grep "^UPLOADS_DIR=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    echo "  ✅ UPLOADS_DIR установлена: $UPLOADS_DIR"
else
    echo "  ❌ UPLOADS_DIR не установлена!"
    echo "  📝 Добавляю UPLOADS_DIR=/var/www/uploads в .env..."
    echo "UPLOADS_DIR=/var/www/uploads" >> .env
    UPLOADS_DIR="/var/www/uploads"
fi

# 2. Проверяем, где находятся файлы
echo ""
echo "2️⃣  Поиск файлов загрузок..."

# Проверяем правильное место
CORRECT_DIR="$UPLOADS_DIR/products"
WRONG_DIR="/root/idylle-spb/public/uploads/products"

FILES_IN_CORRECT=0
FILES_IN_WRONG=0

if [ -d "$CORRECT_DIR" ]; then
    FILES_IN_CORRECT=$(find "$CORRECT_DIR" -type f -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" 2>/dev/null | wc -l)
    echo "  📁 В правильной директории ($CORRECT_DIR): $FILES_IN_CORRECT файлов"
fi

if [ -d "$WRONG_DIR" ]; then
    FILES_IN_WRONG=$(find "$WRONG_DIR" -type f -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" 2>/dev/null | wc -l)
    echo "  📁 В неправильной директории ($WRONG_DIR): $FILES_IN_WRONG файлов"
fi

# 3. Перемещаем файлы, если нужно
if [ "$FILES_IN_WRONG" -gt 0 ]; then
    echo ""
    echo "3️⃣  Перемещение файлов из неправильной директории..."
    
    # Создаем правильную директорию, если её нет
    mkdir -p "$CORRECT_DIR"
    
    # Копируем файлы (не перемещаем, чтобы не потерять данные)
    echo "  📦 Копирую файлы из $WRONG_DIR в $CORRECT_DIR..."
    cp -r "$WRONG_DIR"/* "$CORRECT_DIR"/ 2>/dev/null || true
    
    # Устанавливаем правильные права
    chown -R www-data:www-data "$UPLOADS_DIR"/
    chmod -R 755 "$UPLOADS_DIR"/
    
    echo "  ✅ Файлы скопированы"
    echo "  ⚠️  Старые файлы остались в $WRONG_DIR (можно удалить вручную после проверки)"
fi

# 4. Проверяем Nginx конфигурацию
echo ""
echo "4️⃣  Проверка конфигурации Nginx..."
if grep -q "location /uploads/" /etc/nginx/sites-enabled/aromarussia.ru 2>/dev/null; then
    echo "  ✅ Nginx настроен для /uploads/"
    grep -A 3 "location /uploads/" /etc/nginx/sites-enabled/aromarussia.ru | head -4
else
    echo "  ❌ Nginx НЕ настроен для /uploads/"
    echo "  📝 Добавьте в конфиг Nginx:"
    echo "     location /uploads/ {"
    echo "         alias $UPLOADS_DIR/;"
    echo "         expires 30d;"
    echo "         add_header Cache-Control \"public, immutable\";"
    echo "     }"
fi

# 5. Перезапускаем PM2
echo ""
echo "5️⃣  Перезапуск PM2 с обновленными переменными..."
pm2 restart idylle-spb --update-env

echo ""
echo "✅ Проверка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "  1. Проверьте логи PM2: pm2 logs idylle-spb --lines 20"
echo "  2. Попробуйте открыть изображение: https://aromarussia.ru/uploads/products/[имя_файла]"
echo "  3. Если файлы все еще не видны, проверьте права: ls -la $CORRECT_DIR | head -5"
