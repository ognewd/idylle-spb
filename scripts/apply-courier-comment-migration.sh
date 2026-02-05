#!/usr/bin/env bash
# Добавляет колонку courierComment в таблицу orders, если миграция не применилась.
# Запуск: ./scripts/apply-courier-comment-migration.sh
# Или: npx prisma db execute --file prisma/migrations/20250204000000_add_order_courier_comment/migration.sql

set -e
cd "$(dirname "$0")/.."
npx prisma db execute --file prisma/migrations/20250204000000_add_order_courier_comment/migration.sql
echo "OK: колонка courierComment добавлена (или уже была)."
