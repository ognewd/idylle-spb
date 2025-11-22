# 🚀 Быстрый деплой на Railway - 5 шагов

## 📋 Краткая инструкция

### Шаг 1: Подготовить Git репозиторий

Если проект еще не в Git:

```bash
cd /Users/dognev/idylle-spb
git init
git add .
git commit -m "Initial commit"
```

Если репозиторий есть, убедитесь, что все изменения закоммичены:

```bash
git add .
git commit -m "Prepare for Railway deployment"
```

### Шаг 2: Создать репозиторий на GitHub

1. Откройте https://github.com/new
2. Создайте новый репозиторий (например: `idylle-spb`)
3. **НЕ добавляйте** README, .gitignore, license
4. Скопируйте команды для пуша

### Шаг 3: Запушить код на GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/idylle-spb.git
git branch -M main
git push -u origin main
```

### Шаг 4: Деплой на Railway

1. Откройте https://railway.app
2. Войдите через GitHub
3. Нажмите "+ New Project"
4. Выберите "Deploy from GitHub repo"
5. Найдите `idylle-spb` и выберите его
6. Railway начнет автоматический деплой

### Шаг 5: Добавить базу данных и настроить переменные

1. **Добавить PostgreSQL:**
   - В проекте Railway нажмите "+ New"
   - Выберите "Database" → "Add PostgreSQL"
   - `DATABASE_URL` добавится автоматически

2. **Добавить переменные окружения:**
   - В проекте Railway нажмите на ваше приложение
   - Перейдите в "Variables"
   - Добавьте:
     ```
     NEXTAUTH_SECRET=uvZuO6y91hb2zbxwY3EmtqKH9YeJSyT58AH5nMR3KWY=
     NEXT_PUBLIC_APP_NAME=Idylle
     NEXT_PUBLIC_APP_DESCRIPTION=Люксовые парфюмы и товары для дома
     ```

3. **Получить URL и обновить переменные:**
   - В Settings → Domains найдите URL вашего приложения
   - Обновите в Variables:
     ```
     NEXTAUTH_URL=https://your-app-name.up.railway.app
     NEXT_PUBLIC_BASE_URL=https://your-app-name.up.railway.app
     ```

4. **Применить миграции:**
   ```bash
   npm i -g @railway/cli
   railway login
   railway link
   railway run npx prisma db push
   ```

## ✅ Готово!

Сайт будет доступен по URL из Railway Dashboard.

