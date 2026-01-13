# 🛡️ Защита от потери данных

## ❌ Что могло произойти:

1. **`prisma db push --accept-data-loss`** - может удалить данные при конфликтах схемы
2. **Смена DATABASE_URL** - подключение к другой базе данных
3. **Случайный запуск clear-database.ts**

## ✅ Как предотвратить в будущем:

### 1. Создавайте бэкапы перед миграциями:

```bash
# Создать бэкап базы данных
pg_dump -h localhost -U idylle_user -d idylle_spb > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа
psql -h localhost -U idylle_user -d idylle_spb < backup_YYYYMMDD_HHMMSS.sql
```

### 2. Используйте миграции вместо `db push`:

```bash
# Вместо db push используйте migrate
npx prisma migrate dev --name add_new_column
npx prisma migrate deploy  # на продакшене
```

### 3. Всегда проверяйте DATABASE_URL перед выполнением команд:

```bash
echo $DATABASE_URL  # Проверить текущую базу
```

### 4. Используйте `--skip-seed` и проверки:

```bash
# Сначала проверьте, что будет изменено
npx prisma db push --preview-feature

# Только потом применяйте с подтверждением
npx prisma db push
```

## 🔄 Восстановление данных:

1. Проверьте, есть ли бэкап:
   ```bash
   ls -la /root/backups/
   ls -la /var/backups/
   ```

2. Проверьте логи PostgreSQL:
   ```bash
   tail -100 /var/log/postgresql/postgresql-*.log
   ```

3. Если бэкапа нет - нужно заполнить базу заново через seed:
   ```bash
   npx tsx scripts/seed.ts
   ```

