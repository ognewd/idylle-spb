# ⚡ Быстрый старт - 5 минут

## 🎯 Самый быстрый способ интеграции

### Шаг 1: Откройте оба проекта в Cursor (30 сек)

```bash
# В первом окне Cursor - откройте этот проект
# Во втором окне Cursor - откройте ваш проект
```

### Шаг 2: Скопируйте компоненты (1 мин)

**Перетащите эти файлы** из первого окна во второе:

```
/src/app/components/Header.tsx
/src/app/components/HeroSection.tsx
/src/app/components/FeaturesSection.tsx
/src/app/components/CategoriesSection.tsx
/src/app/components/ProductGallery.tsx
/src/app/components/Footer.tsx
```

➡️ Поместите их в: `src/components/` вашего проекта

### Шаг 3: Установка (1 мин)

Откройте терминал в вашем проекте:

```bash
npm install react-slick slick-carousel lucide-react
```

### Шаг 4: Создайте файл стилей (30 сек)

Создайте файл: `src/styles/animations.css`

```css
@import "slick-carousel/slick/slick.css";
@import "slick-carousel/slick/slick-theme.css";

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
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

.slick-dots li button:before {
  color: #d97706;
  opacity: 0.5;
}

.slick-dots li.slick-active button:before {
  color: #d97706;
  opacity: 1;
}
```

### Шаг 5: Обновите App.tsx (2 мин)

Замените содержимое `App.tsx`:

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

### Шаг 6: Запустите проект (10 сек)

```bash
npm run dev
```

---

## ✅ Готово!

Откройте браузер и наслаждайтесь новым дизайном! 🎉

---

## 🔥 Альтернатива через Cursor AI

Если не хотите копировать файлы вручную:

1. Откройте Cursor Chat (`Cmd/Ctrl + L`)
2. Прикрепите файлы компонентов из этого проекта
3. Напишите:

```
Создай эти компоненты в моем проекте в папке src/components/
Также создай файл animations.css со стилями для слайдера
И обнови App.tsx для их использования
```

Cursor сделает всё автоматически! 🤖

---

## 🎨 Быстрая кастомизация

### Поменять логотип/название

**Cursor AI команда:**
```
Замени "Aroma Boutique" на "Мой Магазин" во всех компонентах
```

### Поменять цвета

**Cursor AI команда:**
```
Замени все amber-600 на blue-600 и все amber оттенки на blue во всех файлах
```

### Добавить свои товары

Откройте `HeroSection.tsx`, найдите:

```tsx
const products = [
  {
    id: 1,
    image: "https://...",  // ← Вставьте свой URL
    name: "Ваш товар",     // ← Ваше название
    price: "1000₽"         // ← Ваша цена
  },
  // Добавьте больше...
];
```

---

## 🆘 Если что-то не работает

### Проблема: Импорты не находятся

**Решение через Cursor AI:**
```
Cmd/Ctrl + K → "Исправь все импорты в компонентах"
```

### Проблема: Tailwind не работает

**Проверьте:**
- Есть ли `tailwind.config.js`?
- Импортирован ли Tailwind в CSS?

**Cursor AI может помочь:**
```
Cmd/Ctrl + L → "Настрой Tailwind CSS для этого проекта"
```

### Проблема: Слайдер не отображается

**Быстрое решение:**
```bash
npm install react-slick slick-carousel --force
```

Затем перезапустите dev-сервер.

---

## 📚 Дополнительные файлы

- `CURSOR_INTEGRATION_GUIDE.md` - Полная инструкция
- `FILES_TO_COPY.md` - Детальный список файлов
- `ALL_COMPONENTS_PACKAGE.md` - Описание всех компонентов

---

**Время интеграции: ~5 минут** ⏱️

**Удачи!** 🚀
