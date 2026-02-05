#!/bin/bash
# Создание дампа БД прода. Запускать на сервере прода (или с машины, у которой есть доступ к prod БД).
#
# На сервере (SSH):
#   cd /root/idylle-spb
#   source .env  # или export DATABASE_URL=...
#   pg_dump "$DATABASE_URL" --no-owner --no-acl -F p -f prod_dump.sql
#   # Скачать к себе: scp user@<YOUR_SERVER_IP>:/root/idylle-spb/prod_dump.sql .
#
# Или локально, если задан PROD_DATABASE_URL (не коммитить!):
#   export PROD_DATABASE_URL="postgresql://..."  # из .env на проде
#   pg_dump "$PROD_DATABASE_URL" --no-owner --no-acl -F p -f prod_dump.sql

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

OUTPUT_FILE="${1:-prod_dump.sql}"

if [ -n "$PROD_DATABASE_URL" ]; then
  echo "Создаю дамп из PROD_DATABASE_URL в $OUTPUT_FILE..."
  pg_dump "$PROD_DATABASE_URL" --no-owner --no-acl -F p -f "$OUTPUT_FILE"
  echo "Готово: $OUTPUT_FILE"
  echo "Восстанови в dev: ./scripts/clone-prod-to-dev.sh $OUTPUT_FILE"
  exit 0
fi

if [ -f .env ] && grep -q '^DATABASE_URL=' .env; then
  export $(grep -v '^#' .env | grep '^DATABASE_URL=' | xargs)
  echo "Создаю дамп из .env DATABASE_URL в $OUTPUT_FILE..."
  pg_dump "$DATABASE_URL" --no-owner --no-acl -F p -f "$OUTPUT_FILE"
  echo "Готово: $OUTPUT_FILE"
  echo "Восстанови в dev: ./scripts/clone-prod-to-dev.sh $OUTPUT_FILE"
  exit 0
fi

echo "Задай PROD_DATABASE_URL или запусти этот скрипт на сервере, где в .env указан DATABASE_URL прода."
echo ""
echo "Пример на сервере:"
echo "  ssh root@<YOUR_SERVER_IP>"
echo "  cd /root/idylle-spb && source .env && pg_dump \"\$DATABASE_URL\" --no-owner --no-acl -F p -f prod_dump.sql"
echo "  exit"
echo "  scp root@<YOUR_SERVER_IP>:/root/idylle-spb/prod_dump.sql ."
echo "  ./scripts/clone-prod-to-dev.sh prod_dump.sql"
