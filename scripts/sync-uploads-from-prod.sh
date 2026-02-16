#!/bin/bash
# Копирование папки uploads с продакшена в локальный public/uploads.
# Картинки товаров и т.п. после клонирования БД локально отсутствуют — этот скрипт их подтягивает.
# Запуск: ./scripts/sync-uploads-from-prod.sh
# Потребуется ввести пароль от root@сервер.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

REMOTE="root@147.45.98.110"
REMOTE_UPLOADS="/var/www/uploads"
LOCAL_UPLOADS="public/uploads"

echo "Копирую загрузки с прода: $REMOTE:$REMOTE_UPLOADS -> $LOCAL_UPLOADS"
mkdir -p "$LOCAL_UPLOADS"

# Копируем содержимое удалённой папки (каталоги products, tasks, categories и т.д.)
scp -r "${REMOTE}:${REMOTE_UPLOADS}/." "$LOCAL_UPLOADS/"

echo ""
echo "Готово. Локально в $LOCAL_UPLOADS лежат те же файлы, что на проде."
