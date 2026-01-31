# 📦 Все компоненты Aroma Boutique - Готовый пакет

## 📋 Быстрая установка

### Шаг 1: Скачайте эти файлы из текущего проекта

Откройте в Cursor оба проекта рядом и скопируйте:

```
Из этого проекта → В ваш проект

/src/app/components/Header.tsx          → /src/components/Header.tsx
/src/app/components/HeroSection.tsx     → /src/components/HeroSection.tsx
/src/app/components/FeaturesSection.tsx → /src/components/FeaturesSection.tsx
/src/app/components/CategoriesSection.tsx → /src/components/CategoriesSection.tsx
/src/app/components/ProductGallery.tsx  → /src/components/ProductGallery.tsx
/src/app/components/Footer.tsx          → /src/components/Footer.tsx
```

### Шаг 2: Установите зависимости

```bash
npm install react-slick slick-carousel lucide-react
```

### Шаг 3: Создайте файл стилей

Создайте файл: `src/styles/animations.css`

Скопируйте содержимое из раздела "CSS стили" ниже ⬇️

### Шаг 4: Импортируйте в App.tsx

Скопируйте код из раздела "Готовый App.tsx" ниже ⬇️

---

## 🎨 CSS стили (animations.css)

Создайте файл `src/styles/animations.css` с этим содержимым:

```css
/* Импорты для слайдера */
@import "slick-carousel/slick/slick.css";
@import "slick-carousel/slick/slick-theme.css";

/* Анимации плавания */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delay-1 {
  animation: float 6s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-float-delay-2 {
  animation: float 6s ease-in-out infinite;
  animation-delay: 2s;
}

/* Стилизация точек слайдера */
.slick-dots li button:before {
  color: #d97706;
  opacity: 0.5;
  font-size: 10px;
}

.slick-dots li.slick-active button:before {
  color: #d97706;
  opacity: 1;
}

/* Стрелки слайдера (если понадобятся) */
.slick-prev:before,
.slick-next:before {
  color: #d97706;
}
```

---

## 📱 Готовый App.tsx

Замените ваш `App.tsx` на этот код:

```tsx
import './styles/animations.css';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CategoriesSection } from './components/CategoriesSection';
import { ProductGallery } from './components/ProductGallery';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CategoriesSection />
        <ProductGallery />
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

---

## 🔧 Альтернатива: Импорт только нужных секций

Если нужна только часть дизайна:

### Только Hero-секция со слайдером

```tsx
import './styles/animations.css';
import { HeroSection } from './components/HeroSection';

function App() {
  return (
    <div>
      <HeroSection />
      {/* Ваш остальной контент */}
    </div>
  );
}
```

### Только хедер и футер

```tsx
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  return (
    <div>
      <Header />
      {/* Ваш контент */}
      <Footer />
    </div>
  );
}
```

### Только галерея продуктов

```tsx
import { ProductGallery } from './components/ProductGallery';

function App() {
  return (
    <div>
      {/* Ваш контент */}
      <ProductGallery />
    </div>
  );
}
```

---

## 📝 Описание компонентов

### 1. **Header.tsx** - Шапка сайта
- Логотип Aroma Boutique
- Навигационное меню
- Иконки корзины и поиска
- Адаптивная мобильная версия

### 2. **HeroSection.tsx** - Главная секция
- Заголовок "The world of fragrances begins here"
- **Слайдер товаров** с автопрокруткой
- Плавающие анимации
- Кнопки CTA
- Адрес магазина

### 3. **FeaturesSection.tsx** - Преимущества
- 4 ключевых преимущества
- Градиентные иконки (золото)
- Премиальный дизайн

### 4. **CategoriesSection.tsx** - Категории
- 3 основные категории ароматов
- Карточки с изображениями
- Hover эффекты

### 5. **ProductGallery.tsx** - Галерея продуктов
- Сетка 3×2 (6 товаров)
- Информация о товаре
- Цены
- Hover эффекты
- Кнопка "View All"

### 6. **Footer.tsx** - Подвал
- 4 колонки информации
- Ссылки на соцсети
- Копирайт

---

## 🎯 Настройка под ваш бренд

### Изменить тексты

**Header.tsx** (строка ~50):
```tsx
<div className="text-2xl font-light tracking-tight">
  Aroma <span className="font-normal">Boutique</span>  {/* ← Замените здесь */}
</div>
```

**HeroSection.tsx** (строки ~15-35):
```tsx
const products = [
  {
    id: 1,
    image: "ВАШ_URL",          // ← Замените на свои изображения
    name: "Ваш товар",         // ← Замените названия
    price: "Ваша цена"         // ← Замените цены
  },
  // ...
];
```

**Footer.tsx** (строка ~110):
```tsx
<p className="text-sm text-gray-500">
  © 2024 Ваше название. Все права защищены.  {/* ← Замените */}
</p>
```

### Изменить адрес магазина

**HeroSection.tsx** (строка ~80):
```tsx
<div className="text-sm text-gray-500 mt-0.5">
  Ваш адрес  {/* ← Замените */}
</div>
```

**Footer.tsx** (строка ~30):
```tsx
<p className="text-sm text-gray-400 leading-relaxed">
  Ваш адрес<br />  {/* ← Замените */}
  График работы
</p>
```

### Изменить цветовую схему

Найдите и замените во всех файлах:

- `amber-600` → ваш основной цвет (например, `blue-600`)
- `amber-700` → ваш темный акцент
- `amber-900` → ваш самый темный акцент
- `gray-900` → цвет текста

### Добавить свои социальные сети

**Footer.tsx** (строки ~60-95):
```tsx
<div className="flex space-x-4">
  <a href="https://instagram.com/ваш_аккаунт" ...>
    <Instagram className="size-5" />
  </a>
  // Добавьте больше иконок
</div>
```

---

## ✅ Проверочный чеклист

После копирования проверьте:

- [ ] Все 6 файлов скопированы в `src/components/`
- [ ] Файл `animations.css` создан в `src/styles/`
- [ ] Зависимости установлены (`npm install`)
- [ ] `App.tsx` обновлен
- [ ] Проект запускается (`npm run dev`)
- [ ] Слайдер работает на Hero-секции
- [ ] Все изображения загружаются
- [ ] Анимации плавания работают
- [ ] Hover эффекты работают
- [ ] Мобильная версия корректна

---

## 🚨 Частые ошибки

### Ошибка: "Cannot find module 'lucide-react'"
**Решение:** `npm install lucide-react`

### Ошибка: "Слайдер не работает"
**Решение:** 
1. Установите: `npm install react-slick slick-carousel`
2. Проверьте импорт CSS в `animations.css`

### Ошибка: "Стили не применяются"
**Решение:**
1. Убедитесь, что Tailwind настроен
2. Импортируйте `animations.css` в `App.tsx`

### Ошибка: "Анимации не работают"
**Решение:** Проверьте, что файл `animations.css` импортирован

---

## 💡 Использование Cursor AI

### Быстрые команды для Cursor

1. **Для изменения всех цветов:**
   - Нажмите `Cmd/Ctrl + K`
   - Напишите: "Замени все amber-600 на blue-600 во всех компонентах"

2. **Для изменения текстов:**
   - Нажмите `Cmd/Ctrl + K`
   - Напишите: "Замени 'Aroma Boutique' на 'Мой Магазин' везде"

3. **Для добавления новых товаров:**
   - Откройте `HeroSection.tsx`
   - Нажмите `Cmd/Ctrl + K`
   - Напишите: "Добавь еще 2 товара в массив products"

4. **Для изменения стилей:**
   - Нажмите `Cmd/Ctrl + L` (Cursor Chat)
   - Спросите: "Как изменить размер текста заголовка в HeroSection?"

---

## 📞 Дополнительная помощь

Если что-то не работает, проверьте:

1. **Консоль браузера** (F12) - на наличие ошибок
2. **Терминал** - на ошибки при запуске
3. **package.json** - что все зависимости установлены

Или спросите Cursor AI:
- "Почему слайдер не работает?"
- "Как исправить эту ошибку: [скопируйте ошибку]"

---

**Готово! Теперь у вас есть полный премиум дизайн для Aroma Boutique** ✨

Если нужна помощь с интеграцией - обращайтесь!
