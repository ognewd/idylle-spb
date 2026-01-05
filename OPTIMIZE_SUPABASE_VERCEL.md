# 🚀 Оптимизация производительности: Vercel + Supabase

## ❌ Проблема: Медленная работа на production

Сайт на Vercel, база данных на Supabase - это может вызывать задержки.

## 🔍 Диагностика

### 1. Проверьте DATABASE_URL в Vercel

1. Зайдите в **Vercel Dashboard** → Ваш проект → **Settings** → **Environment Variables**
2. Найдите `DATABASE_URL`
3. Проверьте формат:

**✅ Правильно (Connection Pooling):**
```
postgresql://postgres.xxxxx:...@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```
- Содержит `.pooler.supabase.com`
- Порт `6543` (для pooling)
- Параметр `?pgbouncer=true`

**❌ Неправильно (прямое подключение):**
```
postgresql://postgres:[pass]@db.xxxxx.supabase.co:5432/postgres
```
- Содержит `db.xxxxx.supabase.co` (без pooler)
- Порт `5432`
- Нет `pgbouncer=true`

### 2. Проверьте регионы

**Vercel:**
- Зайдите в **Vercel Dashboard** → Проект → **Settings** → **General**
- Посмотрите **Region** (обычно `iad1` для US, `fra1` для EU)

**Supabase:**
- Зайдите в **Supabase Dashboard** → Ваш проект → **Settings** → **General**
- Посмотрите **Region** (должен быть близко к Vercel)

**Рекомендации:**
- Если Vercel в EU → Supabase должен быть в EU (Frankfurt/Ireland)
- Если Vercel в US → Supabase должен быть в US

## ✅ Решения

### 1. Использовать Connection Pooling URL (КРИТИЧНО!)

Connection Pooling URL значительно быстрее для serverless функций Vercel.

**Шаги:**

1. **Получите Connection Pooling URL из Supabase:**
   - Зайдите в **Supabase Dashboard** → Ваш проект
   - **Settings** → **Database**
   - Прокрутите вниз до **"Connection Pooling"**
   - Выберите режим: **Session mode** (рекомендуется)
   - Скопируйте Connection String

2. **Обновите DATABASE_URL в Vercel:**
   - Vercel Dashboard → Проект → **Settings** → **Environment Variables**
   - Найдите или создайте `DATABASE_URL`
   - Вставьте Connection Pooling URL
   - Добавьте параметры: `?pgbouncer=true&schema=public`
   - Сохраните

3. **Пересоберите проект:**
   ```bash
   # В Vercel Dashboard нажмите "Redeploy"
   # Или через CLI:
   vercel --prod
   ```

### 2. Проверить регионы (опционально)

Если регионы разные:
- Создайте новый проект Supabase в том же регионе, что и Vercel
- Или измените регион Vercel (в настройках проекта)

### 3. Оптимизировать запросы к БД

Уже реализовано:
- ✅ Индексы на важных полях
- ✅ HTTP кэширование (Cache-Control headers)
- ✅ Select вместо include (для меньшего объема данных)

Можно добавить:
- In-memory кэширование для часто запрашиваемых данных
- Batch запросы (загружать несколько сущностей одним запросом)

### 4. Мониторинг производительности

**В Vercel:**
- Зайдите в **Analytics** → **Functions**
- Посмотрите время выполнения функций
- Найдите медленные запросы

**В Supabase:**
- Зайдите в **Database** → **Reports**
- Посмотрите медленные запросы
- Проверьте использование индексов

## 📊 Ожидаемые результаты

После применения Connection Pooling URL:
- **Снижение latency**: с 100-200ms до 50-100ms
- **Улучшение производительности**: на 30-50%
- **Стабильность**: меньше ошибок "prepared statement already exists"

## 🔧 Быстрая проверка

Запустите в браузере (DevTools → Network):
```javascript
// Проверьте время ответа API
fetch('/api/products?category=aromaty-dlya-doma')
  .then(r => r.json())
  .then(d => console.log('Время:', performance.now()))
```

Ожидаемое время:
- **Хорошо**: < 500ms
- **Приемлемо**: 500-1000ms
- **Медленно**: > 1000ms

## 📝 Чек-лист

- [ ] DATABASE_URL содержит `.pooler.supabase.com`
- [ ] Порт `6543` (для pooling)
- [ ] Параметр `?pgbouncer=true&schema=public`
- [ ] Vercel и Supabase в близких регионах
- [ ] Проект пересобран после изменения DATABASE_URL
- [ ] Проверена производительность в Vercel Analytics

