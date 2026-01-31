# 📦 Список файлов для копирования в Cursor

## 📂 Структура файлов

```
ваш-проект/
├── src/
│   ├── components/           # Создайте эту папку
│   │   ├── Header.tsx       # Скопируйте из /src/app/components/Header.tsx
│   │   ├── HeroSection.tsx  # Скопируйте из /src/app/components/HeroSection.tsx
│   │   ├── FeaturesSection.tsx     # Скопируйте из /src/app/components/FeaturesSection.tsx
│   │   ├── CategoriesSection.tsx   # Скопируйте из /src/app/components/CategoriesSection.tsx
│   │   ├── ProductsGallery.tsx     # Скопируйте из /src/app/components/ProductsGallery.tsx
│   │   └── Footer.tsx       # Скопируйте из /src/app/components/Footer.tsx
│   │
│   └── styles/              # Создайте эту папку (если нет)
│       └── animations.css   # Создайте новый файл (см. инструкции)
│
└── package.json             # Добавьте зависимости
```

## 🔧 Команды для быстрой настройки

### 1. Создание структуры папок (в терминале Cursor):

```bash
mkdir -p src/components
mkdir -p src/styles
```

### 2. Установка зависимостей:

```bash
npm install react-slick slick-carousel lucide-react
```

### 3. Создание файла стилей:

```bash
touch src/styles/animations.css
```

## 📋 Checklist копирования

- [ ] Скопирован `Header.tsx`
- [ ] Скопирован `HeroSection.tsx`
- [ ] Скопирован `FeaturesSection.tsx`
- [ ] Скопирован `CategoriesSection.tsx`
- [ ] Скопирован `ProductsGallery.tsx`
- [ ] Скопирован `Footer.tsx`
- [ ] Создан `animations.css` с анимациями
- [ ] Установлены npm зависимости
- [ ] Импортированы компоненты в главный файл
- [ ] Запущен dev-сервер для проверки

## 🎯 Быстрый старт в Cursor

### Вариант 1: Копирование через Cursor

1. Откройте этот проект в одном окне Cursor
2. Откройте ваш проект в другом окне Cursor
3. Перетащите файлы из `/src/app/components/` в `src/components/` вашего проекта

### Вариант 2: Через AI Composer в Cursor

1. Откройте Cursor AI (Cmd/Ctrl + L)
2. Напишите промпт:

```
Создай компонент Header из этого кода:
[Вставьте код из Header.tsx]

Создай файл в src/components/Header.tsx
```

Повторите для каждого компонента.

### Вариант 3: Через терминал

Если файлы находятся локально:

```bash
# Перейдите в ваш проект
cd /путь/к/вашему/проекту

# Скопируйте компоненты (замените /путь/к/этому/проекту)
cp /путь/к/этому/проекту/src/app/components/*.tsx src/components/
```

## 📝 Порядок действий

1. ✅ Прочитайте `CURSOR_INTEGRATION_GUIDE.md`
2. ✅ Создайте структуру папок
3. ✅ Установите зависимости
4. ✅ Скопируйте все 6 файлов компонентов
5. ✅ Создайте файл стилей `animations.css`
6. ✅ Импортируйте компоненты в `App.tsx`
7. ✅ Запустите проект и проверьте

## 🚀 Готовый код для App.tsx

Скопируйте этот код в ваш `App.tsx`:

```tsx
import './styles/animations.css';
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

## 🎨 Содержимое animations.css

Скопируйте это в `src/styles/animations.css`:

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

## 📦 package.json - добавьте эти зависимости

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

---

**После копирования всех файлов, следуйте инструкциям в CURSOR_INTEGRATION_GUIDE.md** 📚
