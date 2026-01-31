#!/bin/bash
# Восстановление дампа прода в локальную dev-базу (idylle_spb_dev).
# Использование:
#   1. Сначала получи дамп с прода (см. CLONE_PROD_TO_DEV.md или dump-prod.sh).
#   2. Запуск: ./scripts/clone-prod-to-dev.sh путь/к/prod_dump.sql

set -e

DUMP_FILE="${1:-}"

if [ -z "$DUMP_FILE" ] || [ ! -f "$DUMP_FILE" ]; then
  echo "Использование: $0 <путь к файлу дампа .sql>"
  echo "Пример: $0 ./prod_dump.sql"
  echo ""
  echo "Сначала получи дамп с прода (см. CLONE_PROD_TO_DEV.md)."
  exit 1
fi

# Загружаем .env.local для DATABASE_URL
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep 'DATABASE_URL' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: DATABASE_URL не задан. Добавь в .env.local:"
  echo '  DATABASE_URL="postgresql://USER@localhost:5432/idylle_spb_dev"'
  exit 1
fi

# Парсим хост, порт, пользователь и имя БД из URL
# Формат: postgresql://user:pass@host:port/dbname
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^/?]*\).*|\1|p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:@]*\).*|\1|p')

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  echo "Ошибка: не удалось разобрать DATABASE_URL."
  exit 1
fi

DB_PORT="${DB_PORT:-5432}"
DB_HOST="${DB_HOST:-localhost}"

echo "Целевая БД: $DB_NAME на $DB_HOST:$DB_PORT (пользователь: $DB_USER)"
echo "Файл дампа: $DUMP_FILE"
echo ""

# URL к служебной БД postgres (тот же хост/пользователь/пароль, другая база)
ADMIN_URL=$(echo "$DATABASE_URL" | sed "s|/${DB_NAME}.*|/postgres|" | sed 's|?.*||')

echo "1. Отключаю все сессии от базы $DB_NAME..."
psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -t -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true

echo "2. Пересоздаю базу $DB_NAME..."
psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${DB_NAME}\";"
psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${DB_NAME}\";"

echo "3. Восстанавливаю дамп..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DUMP_FILE"

echo ""
echo "Готово. Локальная БД $DB_NAME приведена в состояние из дампа."
echo "Запусти приложение: npm run dev"
