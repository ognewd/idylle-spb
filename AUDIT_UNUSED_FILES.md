# Аудит неиспользуемых файлов

Дата: 2025-02-04

## 1. Можно удалить из репозитория и с диска (безопасно)

### Резервные копии и бэкапы (в Git)
- **`.env.local.backup`**, **`.env.local.bak`**, **`.env.local.bak2`** … **`.env.local.bak6`**, **`.env.production.backup`**  
  Резервные копии env. Могут содержать секреты; в репозитории им не место. Удалить из Git и добавить в `.gitignore` шаблоны `*.bak`, `*.backup` для env.

- **`Dockerfile.backup`** — старый бэкап Dockerfile, не используется.

- **`src/app/checkout/page.tsx.backup`** — бэкап страницы чекаута, не используется.

### Тестовые файлы (в Git, не используются в приложении)
- **`test-admin.html`** — разовая проверка админки.
- **`test-cdek-api.js`** — разовая проверка CDEK API.
- **`scripts/test-success-page.html`** — тестовая страница.

### Папка redisign/ (в Git, ~89 файлов)
- **`redisign/`** — старый дизайн/ветка. В `src/` нет импортов из `redisign/`; в коде только комментарии в `globals.css`. Можно удалить целиком, если новый дизайн уже в основном коде.

### Дамп БД (в Git)
- **`prod_dump.sql`** — дамп продакшн-БД. Обычно не хранят в репозитории (размер, чувствительные данные). Удалить из Git; при необходимости дамп создаётся скриптом `scripts/dump-prod.sh`.

---

## 2. Можно удалить только с диска (не в Git)

Эти файлы не закоммичены; их можно просто удалить с диска.

### SQL-скрипты создания таблиц (устарели, есть Prisma)
- **`create-all-tables.sql`**
- **`create-all-tables-fixed.sql`**
- **`create-settings-table.sql`**
- **`create-tables-correct-names.sql`**  
  Схема теперь ведётся через Prisma и миграции; эти файлы не используются.

---

## 3. Документация в корне (по желанию)

Много одноразовых инструкций по фиксам и деплою. Можно оставить как историю или перенести в `docs/` и по желанию удалить дубли:

- `APPLY_TASKS_MIGRATION.md`, `BASELINE_*.md`, `BULK_PRODUCTS_TRANSFER.md`, `CDEK_INTEGRATION_PLAN.md`, `CHECK_PRODUCTION.md`, `CLONE_PROD_TO_DEV.md`
- `DEPLOY_*.md`, `DEPLOYMENT_*.md`, `DEPLOY_INSTRUCTIONS.txt`
- `EMAIL_*.md`, `EMAIL_SETUP_MAILTRAP.txt`
- `FIX_*.md`, `FIX_UPLOADS_DIR.md`, `PREVENT_DOWNTIME.md`, `QUICK_FIX_PAGES.md`
- `PAGES_CMS_*.md`, `PROJECT_STATUS.md`, `REDESIGN_BRANCH.md`, `SECURITY_AUDIT.md`, `SERVER_TROUBLESHOOTING.md`, `SMTP_SETUP_GUIDE.md`, `TEST_DEPLOY.md`, `WHY_SITE_DOWN.md`
- `CATEGORY_IMAGES_SPEC.md`

Удалять не обязательно; при желании можно объединить в несколько актуальных гайдов.

---

## 4. Скрипты в scripts/

**Используются в сборке/деплое/package.json:**
- `scripts/seed.ts` — `npm run db:seed`
- `scripts/seed-pages.ts` — деплой (GitHub Actions)
- `scripts/health-check.sh` — деплой
- `scripts/check-production-vps.ts` — `npm run check:prod`

Остальные скрипты — разовые (seed, тесты, фиксы). Их можно не удалять (история, повторный запуск при необходимости), но при желании можно вынести в архив или удалить явно устаревшие (например, дублирующие друг друга тесты).

---

## 5. Данные data/

- **Используются:** `brands-correct.csv`, `categories.csv`, `users.csv`, `products-correct.csv`, `product-categories-correct.csv` (в `scripts/import-data.ts`, `scripts/import-products-only.ts`).
- **Вероятно дубликаты:** `brands.csv`, `products.csv`, `product-categories.csv` — в коде везде только `*-correct.csv`. После проверки можно удалить некорректные версии.

---

## 6. Public

- **`public/placeholder-product.jpg`** — используется как fallback для картинок товаров.
- **`public/logo-idylle.png`** — логотип в шапке.
- **`public/brands/`** — используется на странице `/brands`.
- **`public/dr-vranjes-albero.png`** — проверить использование при желании.
- **`public/hero-video-setup.md`** — инструкция; по желанию перенести в `docs/` или удалить.

---

## 7. Секреты (не должны быть в Git)

- Файлы `.supabase*` добавлены в `.gitignore` (Supabase не используется).

---

## Рекомендуемые действия

1. Удалить из Git и с диска: env-бэкапы, `Dockerfile.backup`, `page.tsx.backup`, тестовые html/js, папку `redisign/`, `prod_dump.sql`.
2. Добавить в `.gitignore`: `*.bak`, `*.backup`, `prod_dump.sql`.
3. Удалить с диска (без удаления из Git): корневые `create-*.sql` (они не в Git).
4. По желанию: почистить или сгруппировать корневые `.md`, проверить дубликаты в `data/*.csv`.
