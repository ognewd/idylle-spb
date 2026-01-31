# 📦 ФИНАЛЬНЫЕ ФАЙЛЫ - CSS и App.tsx

## 7️⃣ animations.css

**Создайте файл:** `src/styles/animations.css`

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
.slick-dots {
  bottom: -40px;
}

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
.slick-prev,
.slick-next {
  z-index: 10;
}

.slick-prev:before,
.slick-next:before {
  color: #d97706;
  font-size: 30px;
}

.slick-prev {
  left: -40px;
}

.slick-next {
  right: -40px;
}

/* Плавная прокрутка */
html {
  scroll-behavior: smooth;
}

/* Дополнительные стили для премиум-эффектов */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

.drop-shadow-2xl {
  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25));
}

/* Убрать outline у слайдера */
.slick-slider,
.slick-list,
.slick-track,
.slick-slide,
.slick-slide > div {
  outline: none !important;
}

/* Скрыть overflow для слайдера */
.slick-slider {
  overflow: hidden;
}
```

---

## 8️⃣ App.tsx

**Замените содержимое файла:** `src/App.tsx`

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

## 9️⃣ package.json (добавьте зависимости)

**Добавьте в ваш** `package.json`:

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-slick": "^0.31.0",
    "slick-carousel": "^1.8.1",
    "lucide-react": "^0.487.0"
  }
}
```

**Или установите через терминал:**

```bash
npm install react-slick slick-carousel lucide-react
```

---

## 🔟 Tailwind конфигурация (если нужно)

Если у вас еще нет Tailwind CSS, создайте файл: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay-1': 'float 6s ease-in-out infinite 1s',
        'float-delay-2': 'float 6s ease-in-out infinite 2s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
```

И создайте файл: `src/index.css` (если его нет)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## ✅ Итоговая структура файлов

```
ваш-проект/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 ✅
│   │   ├── HeroSection.tsx            ✅
│   │   ├── FeaturesSection.tsx        ✅
│   │   ├── CategoriesSection.tsx      ✅
│   │   ├── ProductGallery.tsx         ✅
│   │   └── Footer.tsx                 ✅
│   │
│   ├── styles/
│   │   └── animations.css             ✅
│   │
│   ├── App.tsx                        ✅
│   └── index.css                      ✅
│
├── package.json                       ✅
└── tailwind.config.js                 ✅
```

---

## 🚀 Запуск проекта

### Шаг 1: Установите зависимости

```bash
npm install
```

### Шаг 2: Запустите dev-сервер

```bash
npm run dev
```

### Шаг 3: Откройте браузер

```
http://localhost:5173
```

(или другой порт, указанный в терминале)

---

## 🎨 Что можно настроить

### Тексты и контент

- **Header.tsx** - логотип, меню, контакты
- **HeroSection.tsx** - заголовки, адрес, товары в слайдере
- **Footer.tsx** - контакты, ссылки, email

### Изображения

Замените URL в:
- **HeroSection.tsx** - товары в слайдере (строки 10-31)
- **CategoriesSection.tsx** - категории (строки 5-23)
- **ProductGallery.tsx** - галерея (строки 5-48)

### Цвета

Найдите и замените:
- `amber-600` → ваш основной цвет
- `gray-900` → ваш темный цвет
- `purple-600` → ваш акцентный цвет

---

## 🆘 Возможные проблемы

### Ошибка: "Cannot find module"

**Решение:**
```bash
npm install react-slick slick-carousel lucide-react
```

### Слайдер не работает

**Решение:**
1. Проверьте импорт CSS в `animations.css`
2. Убедитесь, что `animations.css` импортирован в `App.tsx`

### Tailwind не работает

**Решение:**
1. Убедитесь, что Tailwind установлен
2. Проверьте `tailwind.config.js`
3. Проверьте импорт в `index.css`

---

## 💡 Советы по Cursor

### Быстрое создание файлов

1. Скопируйте код компонента
2. В Cursor нажмите `Cmd/Ctrl + N` (новый файл)
3. Вставьте код
4. Сохраните как `src/components/ComponentName.tsx`

### Использование AI

```
Cursor Chat (Cmd/Ctrl + L):
"Создай файл src/components/Header.tsx с этим кодом: [вставьте код]"
```

### Массовое создание

```
Cursor Composer (Cmd/Ctrl + K):
"Создай все компоненты из [прикрепите файлы COPY_PASTE_COMPONENTS]"
```

---

## ✨ Готово!

Теперь у вас есть все файлы для интеграции дизайна Aroma Boutique!

**Следующие шаги:**
1. ✅ Скопировать все компоненты
2. ✅ Создать файл стилей
3. ✅ Обновить App.tsx
4. ✅ Установить зависимости
5. ✅ Запустить проект
6. 🎉 Наслаждаться результатом!

---

**Удачи с интеграцией!** 🚀
