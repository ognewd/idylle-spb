# 🔧 Исправление ошибки подключения к базе данных

## ❌ Проблема

При логине на продакшене возникает ошибка:
```
Error querying the database: FATAL: Tenant or user not found
```

Это означает, что **Prisma не может подключиться к базе данных Supabase**.

## 🔍 Возможные причины

1. **Неправильный формат `DATABASE_URL`** для Supabase
2. **Неправильные credentials** (пользователь или пароль)
3. **Техническое обслуживание Supabase** (Nov 21-23, 2025)
4. **Изменение настроек** после удаления интеграции Supabase

## ✅ Решение

### Шаг 1: Проверить правильный формат DATABASE_URL для Supabase

Для Supabase нужно использовать правильный формат connection string. Есть два варианта:

#### Вариант 1: Connection Pooling URL (Рекомендуется для продакшена)

Формат:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Или короткий формат:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true
```

#### Вариант 2: Direct Connection URL (для миграций)

Формат:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**ВАЖНО:** Для продакшена на Vercel рекомендуется использовать **Connection Pooling URL** (вариант 1).

### Шаг 2: Получить правильный Connection String из Supabase

1. Перейдите на https://supabase.com/dashboard
2. Откройте проект `idylle-spb` (или ваш проект)
3. Перейдите в **Settings** → **Database**
4. Найдите секцию **"Connection string"** или **"Connection pooling"**
5. Выберите **"Session mode"** (для connection pooling)
6. Скопируйте строку подключения

**Формат будет выглядеть примерно так:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Шаг 3: Обновить DATABASE_URL в Vercel

1. Перейдите на https://vercel.com/dognevs-projects/idylle-spb/settings/environment-variables
2. Найдите переменную `DATABASE_URL` для **Production**
3. Нажмите на редактирование (или добавьте новую, если ее нет)
4. Вставьте правильный Connection String из Supabase
5. Убедитесь, что выбран **Production** environment
6. Нажмите **"Save"**

### Шаг 4: Пересобрать проект

После обновления переменной окружения:

```bash
cd /Users/dognev/idylle-spb
vercel --prod
```

Или дождитесь автоматической пересборки (Vercel может пересобрать проект автоматически после изменения переменных).

## 🔍 Проверка подключения

### Вариант 1: Проверить через Prisma Studio (локально)

1. Скачайте переменные окружения:
   ```bash
   vercel env pull .env.local
   ```

2. Проверьте подключение:
   ```bash
   npx prisma studio
   ```

3. Если Prisma Studio открывается и показывает данные - подключение работает.

### Вариант 2: Проверить через скрипт

Создайте временный скрипт для проверки:

```typescript
// scripts/check-prod-connection.ts
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    console.log('Проверяем подключение к базе данных...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    await prisma.$connect();
    console.log('✅ Подключение успешно!');
    
    const userCount = await prisma.user.count();
    console.log(`✅ Количество пользователей: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
```

Запустите:
```bash
tsx scripts/check-prod-connection.ts
```

## ⚠️ Важные замечания

### 1. Connection Pooling для продакшена

Для продакшена на Vercel **обязательно** используйте Connection Pooling URL, так как:
- Vercel Serverless Functions создают много соединений
- Connection pooling управляет соединениями эффективнее
- Прямое подключение может привести к исчерпанию лимитов соединений

### 2. Разные URL для разных целей

- **Connection Pooling URL** (с `?pgbouncer=true`) - для приложения (продакшен)
- **Direct Connection URL** - для миграций и Prisma Studio (локально)

### 3. Техническое обслуживание Supabase

Если Supabase находится на техническом обслуживании (Nov 21-23, 2025), подключение может быть недоступно. В этом случае нужно:
- Подождать окончания обслуживания
- Проверить статус на https://status.supabase.com

## 📝 Формат для разных сред

### Production (Vercel):
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Development (локально):
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

## ✅ После исправления

После обновления `DATABASE_URL` и пересборки проекта:
1. Попробуйте войти в админ-панель
2. Проверьте, что ошибка "Tenant or user not found" исчезла
3. Убедитесь, что данные загружаются нормально

## 🔗 Полезные ссылки

- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Environment Variables: https://vercel.com/dognevs-projects/idylle-spb/settings/environment-variables
- Supabase Status: https://status.supabase.com

