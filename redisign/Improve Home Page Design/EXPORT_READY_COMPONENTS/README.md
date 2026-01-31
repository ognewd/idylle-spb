# 📦 Готовые компоненты Aroma Boutique

## 📍 Вы здесь: `/EXPORT_READY_COMPONENTS/`

В этой папке находятся **все 6 готовых компонентов** без зависимостей от Figma Make.

---

## 📂 Файлы в этой папке:

✅ `Header.tsx` - Шапка сайта  
✅ `HeroSection.tsx` - Главная секция со слайдером  
✅ `FeaturesSection.tsx` - Секция преимуществ  
✅ `CategoriesSection.tsx` - Категории товаров  
✅ `ProductGallery.tsx` - Галерея из 6 продуктов  
✅ `Footer.tsx` - Подвал сайта

---

## 🚀 Как использовать:

### **Способ 1: Копирование через Cursor**

1. **Откройте этот проект в Cursor**
2. **Откройте ваш проект во втором окне Cursor**  
3. **Перетащите файлы** из `/EXPORT_READY_COMPONENTS/` в `src/components/` вашего проекта

### **Способ 2: Вручную через Copy-Paste**

1. Откройте каждый файл (Header.tsx, HeroSection.tsx и т.д.)
2. Скопируйте весь код (Cmd/Ctrl + A, затем Cmd/Ctrl + C)
3. В вашем проекте создайте файл `src/components/Header.tsx`
4. Вставьте код (Cmd/Ctrl + V)
5. Повторите для всех 6 файлов

### **Способ 3: Через терминал** (если файлы локально)

```bash
# В вашем проекте
cp /путь/к/этому/проекту/EXPORT_READY_COMPONENTS/*.tsx src/components/
```

---

## 📦 Установка зависимостей

После копирования файлов установите:

```bash
npm install react-slick slick-carousel lucide-react
```

---

## 🎨 Создайте файл стилей

Создайте `src/styles/animations.css`:

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
}

.slick-dots li.slick-active button:before {
  color: #d97706;
  opacity: 1;
}
```

---

## 📱 Обновите App.tsx

Замените содержимое вашего `App.tsx`:

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
    <div className="min-h-screen">
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

## 🏃 Запустите проект

```bash
npm run dev
```

Откройте браузер и наслаждайтесь! 🎉

---

## ✅ Checklist

- [ ] Скопировал все 6 файлов в `src/components/`
- [ ] Установил зависимости (`npm install`)
- [ ] Создал `animations.css` в `src/styles/`
- [ ] Обновил `App.tsx`
- [ ] Импортировал `animations.css` в `App.tsx`
- [ ] Запустил проект (`npm run dev`)
- [ ] Всё работает! ✨

---

## 🎨 Особенности компонентов:

### Header.tsx
- Верхняя панель с контактами
- Поиск по товарам
- Корзина, избранное, профиль
- Навигационное меню

### HeroSection.tsx ⭐
- **Автоматический слайдер** с 4 товарами
- Плавающие анимации
- CTA кнопки
- Адрес магазина

### FeaturesSection.tsx
- 3 преимущества с иконками
- Золотые градиенты
- Hover эффекты

### CategoriesSection.tsx
- 3 категории с изображениями
- Градиентные оверлеи
- Hover zoom эффекты

### ProductGallery.tsx
- Сетка 3×2 (6 товаров)
- Featured badge
- Hover оверлей с кнопкой
- Цены и категории

### Footer.tsx
- Форма подписки
- 4 колонки информации
- Социальные сети
- Контакты и адрес

---

## 🔧 Кастомизация

### Изменить товары в слайдере

Откройте `HeroSection.tsx`, найдите массив `products`:

```tsx
const products = [
  {
    id: 1,
    image: "ВАШ_URL",      // ← Замените
    name: "Ваш товар",     // ← Замените
    price: "Цена"          // ← Замените
  },
  // Добавьте больше...
];
```

### Изменить логотип/название

Найдите и замените:
- В Header.tsx: "Aroma Boutique"
- В Footer.tsx: "Aroma Boutique"

### Изменить цвета

Найдите и замените во всех файлах:
- `amber-600` → ваш цвет (например, `blue-600`)
- `amber-700` → ваш темный оттенок
- `gray-900` → цвет текста

---

## 🆘 Решение проблем

### Слайдер не работает
```bash
npm install react-slick slick-carousel --force
```

### Стили не применяются
Проверьте, что:
- Импортирован `animations.css` в `App.tsx`
- Tailwind CSS настроен

### Импорты не находятся
Убедитесь, что пути правильные:
```tsx
import { Header } from './components/Header';
// НЕ:
// import { Header } from '@/components/Header';
```

---

## 📚 Дополнительно

- Все компоненты полностью независимы
- Нет зависимостей от Figma Make
- Работают с любой версией React 18+
- Используют Tailwind CSS
- Полностью адаптивны

---

**Готово! Теперь у вас есть все файлы** ✨

Если нужна помощь - спросите Cursor AI или посмотрите другие .md файлы в корне проекта.
