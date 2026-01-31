# 🎨 Инструкция по интеграции дизайна Aroma Boutique в Cursor

## 📋 Шаг 1: Установка зависимостей

Откройте терминал в Cursor и выполните:

```bash
npm install react-slick slick-carousel lucide-react
```

Или если используете yarn:

```bash
yarn add react-slick slick-carousel lucide-react
```

## 📁 Шаг 2: Создание структуры папок

Создайте папку для компонентов (если её нет):

```bash
mkdir -p src/components
```

## 📄 Шаг 3: Копирование файлов компонентов

Скопируйте следующие файлы в папку `src/components/`:

1. `Header.tsx`
2. `HeroSection.tsx`
3. `FeaturesSection.tsx`
4. `CategoriesSection.tsx`
5. `ProductsGallery.tsx`
6. `Footer.tsx`

Все файлы находятся в этом проекте в папке `/src/app/components/`

## 🎨 Шаг 4: Настройка стилей

### Вариант А: Если используете отдельный CSS файл

Создайте файл `src/styles/animations.css` и добавьте:

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
```

Затем импортируйте этот файл в ваш главный файл (например, `App.tsx` или `index.tsx`):

```tsx
import './styles/animations.css';
```

### Вариант Б: Если используете Tailwind CSS v4

Добавьте в ваш главный CSS файл (обычно `src/index.css` или `src/styles/globals.css`):

```css
@import "tailwindcss";
@import "slick-carousel/slick/slick.css";
@import "slick-carousel/slick/slick-theme.css";

@layer utilities {
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
}
```

## 🔧 Шаг 5: Интеграция компонентов

### Вариант 1: Полная главная страница

Замените содержимое вашего `App.tsx` или главной страницы:

```tsx
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CategoriesSection } from './components/CategoriesSection';
import { ProductsGallery } from './components/ProductsGallery';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CategoriesSection />
        <ProductsGallery />
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

### Вариант 2: Частичная интеграция

Если нужна только определенная секция, импортируйте только нужные компоненты:

```tsx
import { HeroSection } from './components/HeroSection';

function HomePage() {
  return (
    <div>
      {/* Ваш существующий код */}
      <HeroSection />
      {/* Остальной контент */}
    </div>
  );
}
```

## 🎯 Шаг 6: Настройка путей импорта (опционально)

Если в вашем проекте используется alias `@` для импортов, обновите импорты в компонентах:

**Было:**
```tsx
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
```

**Должно быть:**
```tsx
import { ImageWithFallback } from './ImageWithFallback';
// или
import { ImageWithFallback } from '@/components/ImageWithFallback';
```

## 📝 Шаг 7: Настройка изображений

### Изображения продуктов в слайдере

Откройте `HeroSection.tsx` и замените URL изображений на свои:

```tsx
const products = [
  {
    id: 1,
    image: "ВАШ_URL_ИЗОБРАЖЕНИЯ_1",
    name: "Название продукта 1",
    price: "Цена"
  },
  // ... остальные продукты
];
```

### Изображения в других секциях

Аналогично обновите изображения в:
- `CategoriesSection.tsx` - категории ароматов
- `ProductsGallery.tsx` - галерея продуктов

## ✅ Шаг 8: Проверка

Запустите проект:

```bash
npm run dev
```

Или:

```bash
yarn dev
```

Откройте браузер и проверьте, что все компоненты отображаются корректно.

## 🔧 Возможные проблемы и решения

### Проблема: Компоненты не стилизованы

**Решение:** Убедитесь, что:
1. Tailwind CSS настроен корректно
2. Импортирован CSS файл со стилями слайдера
3. Путь к CSS файлу правильный

### Проблема: Слайдер не работает

**Решение:**
1. Проверьте, что установлены `react-slick` и `slick-carousel`
2. Проверьте импорт CSS для слайдера
3. Убедитесь, что нет конфликтов версий React

### Проблема: Иконки не отображаются

**Решение:**
1. Установите `lucide-react`: `npm install lucide-react`
2. Проверьте импорты в компонентах

### Проблема: "Cannot find module" ошибки

**Решение:**
1. Проверьте пути импортов
2. Убедитесь, что все файлы скопированы в правильные папки
3. Перезапустите dev-сервер

## 🎨 Кастомизация

### Изменение цветовой схемы

Найдите и замените в компонентах:
- `amber-600` → ваш основной цвет
- `gray-900` → ваш темный цвет
- `purple-600` → ваш акцентный цвет

### Изменение шрифтов

Добавьте в ваш CSS файл:

```css
@import url('https://fonts.googleapis.com/css2?family=Ваш+Шрифт&display=swap');

body {
  font-family: 'Ваш Шрифт', sans-serif;
}
```

### Адаптация под ваш бренд

1. Замените тексты в компонентах
2. Обновите адрес магазина в `HeroSection.tsx` и `Footer.tsx`
3. Измените логотип в `Header.tsx`
4. Добавьте ссылки на соцсети в `Footer.tsx`

## 📚 Дополнительная документация

- [React Slick](https://react-slick.neostack.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 💡 Советы по использованию Cursor

1. **Используйте Cursor Composer** (Cmd/Ctrl+K) для быстрых правок компонентов
2. **Спросите Cursor AI** о любых непонятных частях кода
3. **Используйте автодополнение** для импортов и компонентов
4. **Cmd/Ctrl+Click** на импорте откроет файл компонента

## 🤝 Нужна помощь?

Если возникли проблемы:
1. Проверьте консоль браузера на ошибки
2. Проверьте терминал на ошибки сборки
3. Убедитесь, что все зависимости установлены
4. Спросите Cursor AI о конкретной ошибке

---

**Создано для Aroma Boutique - Luxury Fragrance Experience** ✨
