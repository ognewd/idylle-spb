# 📋 Резюме проекта Idylle SPB для ChatGPT

## 🎯 Проект: Интернет-магазин парфюмов и товаров для дома

**Название:** Idylle SPB  
**Тип:** E-commerce платформа  
**Статус:** Разработка завершена, готов к деплою

---

## 🔧 Технологический стек

**Frontend:**
- Next.js 14.0.4 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui компоненты
- Lucide React иконки

**Backend:**
- Next.js API Routes (встроенный backend)
- Prisma ORM 5.7.1
- PostgreSQL 15.14
- NextAuth.js для аутентификации
- JWT для админ-панели

**Инструменты:**
- bcryptjs для хеширования паролей
- xlsx для импорта Excel
- qrcode для генерации QR-кодов
- react-hook-form + zod для валидации форм

---

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Главная страница
│   ├── catalog/           # Каталог товаров
│   ├── admin/             # Админ-панель
│   └── api/               # API endpoints
├── components/            # React компоненты
│   ├── layout/           # Header, Footer, AdminToolbar
│   ├── product/          # ProductCard, ProductInfo, ProductFilters
│   └── admin/            # Админ компоненты
├── contexts/             # React Context
│   ├── CartContext.tsx   # Корзина (localStorage)
│   └── WishlistContext.tsx # Избранное (localStorage)
└── lib/                  # Утилиты
    ├── prisma.ts         # Prisma клиент
    └── auth.ts           # NextAuth конфигурация
```

---

## 🗄️ База данных

**Текущее состояние:**
- Локальная PostgreSQL: `postgresql://dognev@localhost:5432/idylle_spb`
- 1045 товаров
- 3 категории
- 20 брендов
- Администраторы настроены

**Основные таблицы:**
- `users` - пользователи (роли: user, admin, super_admin)
- `products` - товары
- `categories` - категории
- `brands` - бренды
- `product_categories` - связь товаров и категорий (many-to-many)
- `product_images` - изображения товаров
- `product_variants` - варианты товаров (объемы, размеры)
- `orders` - заказы
- `order_items` - товары в заказах
- `reviews` - отзывы
- `seasonal_discounts` - сезонные скидки

**Поля товаров из Excel:**
- `myWarehouseCode` - Код Мой склад (главный ID)
- `manufacturerSku` - Артикул производителя
- `productType` - Вид товара
- `purpose` - Назначение (для какого помещения)
- `country` - Страна
- `barcode` - Штрихкод

---

## 🔑 Доступ к админ-панели

**Email:** `admin@idylle.spb.ru`  
**Пароль:** `admin123`  
**URL:** `http://localhost:3000/admin/login`

---

## ✨ Ключевые функции

### Публичная часть:
1. **Каталог товаров** - список, фильтрация, поиск, пагинация
2. **Страницы категорий:**
   - `/aromaty-dlya-doma` - Ароматы для дома
   - `/uyut-i-interer` - Уют и интерьер
   - `/podarki` - Подарки
3. **Детальная страница товара** - изображения, варианты, описание, отзывы
4. **Корзина покупок** - хранение в localStorage через CartContext
5. **Избранное** - хранение в localStorage через WishlistContext
6. **Ленивая загрузка** - infinite scroll через IntersectionObserver
7. **Серверная фильтрация** - все фильтры обрабатываются на бэкенде

### Админ-панель:
1. **Управление товарами** - CRUD операции
2. **Импорт из Excel** - массовое добавление/обновление товаров
3. **Загрузка изображений** - множественная загрузка фото
4. **Управление категориями и брендами**
5. **Сезонные скидки** - на товары или категории
6. **Управление заказами**
7. **QR-коды** - генерация для товаров

---

## 🔌 API Endpoints

### Публичные:
- `GET /api/products` - список товаров (фильтры, пагинация)
- `GET /api/products/[slug]` - детали товара
- `GET /api/filters` - фильтры для каталога
- `GET /api/categories`, `/api/brands` - списки

### Админские (JWT авторизация):
- `GET/POST/PUT/DELETE /api/admin/products` - управление товарами
- `POST /api/admin/upload` - загрузка изображений
- `POST /api/admin/import/parse` - парсинг Excel файлов
- `POST /api/admin/login` - вход в админку

---

## 🎨 UI/UX особенности

- **Responsive дизайн** - работает на мобильных и десктопе
- **Фильтры** - развертывание списков (>5 значений), сортировка по количеству товаров
- **Избранное** - кнопка сердечка всегда видна на карточках товаров
- **Корзина** - счетчик в Header, синхронизация через Context
- **Админ-тулбар** - индикатор авторизации вверху страницы
- **Ленивая загрузка** - подгрузка товаров при скролле

---

## 📦 Особенности реализации

### Фильтрация:
- Серверная фильтрация через Prisma
- URL параметры: `?filter_category=...&filter_brand=...`
- Поддержка множественных значений
- Фильтры учитывают категорию страницы

### Ленивая загрузка:
- Использует IntersectionObserver
- Предотвращает прокрутку страницы при прокрутке фильтров
- Загружает по 24 товара за раз

### Загрузка изображений:
- Сохранение в `public/uploads/products/`
- Поддержка множественной загрузки
- Автоматическое именование файлов

### Избранное и корзина:
- Хранение в `localStorage`
- Синхронизация через React Context
- Сохранение между сессиями

---

## 🚀 Деплой

**Статус:** Готов к деплою (~95%)

**Настроено:**
- ✅ Git репозиторий: `https://github.com/ognewd/idylle-spb.git`
- ✅ Supabase проект создан
- ✅ Переменные окружения подготовлены

**Нужно сделать:**
- ⏳ Подключить Vercel
- ⏳ Применить схему БД в Supabase
- ⏳ Настроить переменные окружения в Vercel

**Production URL:** `https://idylle-spb.vercel.app` (будет после деплоя)

---

## 🔒 Безопасность

- Пароли хешируются через bcrypt (10-12 rounds)
- JWT токены для админки
- Проверка ролей в API routes
- Валидация данных на сервере

---

## 📝 Переменные окружения

**Локально (`.env.local`):**
```
DATABASE_URL="postgresql://dognev@localhost:5432/idylle_spb"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

**Production (нужно настроить в Vercel):**
```
DATABASE_URL="supabase-connection-string"
NEXTAUTH_SECRET="generated-secret"
NEXTAUTH_URL="https://idylle-spb.vercel.app"
NEXT_PUBLIC_BASE_URL="https://idylle-spb.vercel.app"
```

---

## 🐛 Известные особенности

1. **Главная страница** (`/`) редиректит на `/aromaty-dlya-doma`
2. **Избранное** работает через localStorage (не сохраняется между устройствами)
3. **Корзина** также через localStorage
4. **Админ-панель** требует JWT токен в localStorage

---

## 📊 Статистика

- **Товаров:** 1045
- **Категорий:** 3
- **Брендов:** 20
- **Администраторов:** 2 (admin@idylle.spb.ru - super_admin)

---

## 🔄 Последние изменения

1. Удалены все связи с продакшеном
2. Исправлена кнопка избранного (всегда видна, использует Context)
3. Очищен код от хардкод URL
4. Настроена ленивая загрузка с правильной обработкой скролла фильтров
5. Реализована серверная фильтрация

---

## 💡 Команды разработки

```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run db:push      # Применить схему БД
npm run db:seed      # Заполнить тестовыми данными
npm run db:studio    # Prisma Studio (GUI для БД)
```

---

## 📚 Ключевые файлы

- `src/app/layout.tsx` - корневой layout с провайдерами
- `src/components/product/ProductCard.tsx` - карточка товара
- `src/components/product/ProductInfo.tsx` - детали товара
- `src/contexts/CartContext.tsx` - управление корзиной
- `src/contexts/WishlistContext.tsx` - управление избранным
- `src/app/api/products/route.ts` - API товаров
- `prisma/schema.prisma` - схема базы данных

---

**Проект готов к использованию и деплою на Vercel + Supabase.**

