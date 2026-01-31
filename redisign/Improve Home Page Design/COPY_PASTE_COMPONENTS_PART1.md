# 📦 ВСЕ ФАЙЛЫ КОМПОНЕНТОВ - Готовый код для копирования

> **Просто скопируйте каждый блок кода в соответствующий файл в вашем проекте**

---

## 📁 Структура файлов

Создайте эти файлы в вашем проекте:

```
ваш-проект/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── CategoriesSection.tsx
│   │   ├── ProductGallery.tsx
│   │   └── Footer.tsx
│   │
│   ├── styles/
│   │   └── animations.css
│   │
│   └── App.tsx
│
└── package.json
```

---

## 1️⃣ Header.tsx

**Создайте файл:** `src/components/Header.tsx`

```tsx
import { Search, Heart, ShoppingCart, User, Phone, MapPin } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:8-800-500-87-29" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Phone className="size-4" />
                <span>8-800-500-87-29</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <MapPin className="size-4" />
                <span>St. Petersburg, Nevsky Prospect, 114-116</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</a>
              <a href="#delivery" className="text-gray-600 hover:text-gray-900 transition-colors">Delivery</a>
              <a href="#contacts" className="text-gray-600 hover:text-gray-900 transition-colors">Contacts</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-2xl font-light tracking-tight text-gray-900">
              Aroma <span className="font-normal">Boutique</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for fragrances"
                className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white p-2 rounded-md hover:bg-gray-800 transition-colors">
                <Search className="size-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Heart className="size-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs size-5 flex items-center justify-center rounded-full">
                1
              </span>
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <ShoppingCart className="size-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <User className="size-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 py-4">
            <a href="#business" className="text-gray-700 hover:text-amber-600 transition-colors">
              Fragrances for business
            </a>
            <a href="#home" className="text-gray-700 hover:text-amber-600 transition-colors">
              Home fragrances
            </a>
            <a href="#comfort" className="text-gray-700 hover:text-amber-600 transition-colors">
              Comfort and interior
            </a>
            <a href="#present" className="text-gray-700 hover:text-amber-600 transition-colors">
              Present
            </a>
            <a href="#bathroom" className="text-gray-700 hover:text-amber-600 transition-colors">
              Bathroom
            </a>
            <a href="#dealers" className="text-gray-700 hover:text-amber-600 transition-colors">
              For dealers
            </a>
            <a href="#stock" className="text-amber-600 hover:text-amber-700 transition-colors">
              Stock
            </a>
            <a href="#sale" className="text-red-600 hover:text-red-700 transition-colors">
              Sale
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
```

---

## 2️⃣ HeroSection.tsx

**Создайте файл:** `src/components/HeroSection.tsx`

```tsx
import { MapPin, ShoppingBag, ArrowRight } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function HeroSection() {
  const products = [
    {
      id: 1,
      image: "https://aromarussia.ru/uploads/products/1769697266814-bmbbf80h91n.jpg",
      name: "Mathilde M Diffuser",
      price: "8,500₽"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1760113559708-84e7a148ec68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      name: "Velvet Noir",
      price: "24,500₽"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1737920459846-2d0318700658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      name: "Golden Essence",
      price: "32,900₽"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1640869116016-93c00ba94b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      name: "Midnight Rose",
      price: "26,300₽"
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    arrows: false,
    pauseOnHover: true
  };

  return (
    <section className="relative min-h-[85vh] bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 size-96 bg-amber-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 size-96 bg-purple-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh] py-12">
          {/* Left side - Content */}
          <div className="space-y-8 lg:pr-12">
            {/* Main heading */}
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight tracking-tight text-gray-900 leading-[1.1]">
                The world of
              </h1>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]">
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                  fragrances
                </span>
              </h1>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight tracking-tight text-gray-900 leading-[1.1]">
                begins here
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-xl font-light leading-relaxed">
              Discover unique perfume collections from leading global brands. Experience luxury in every note.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <button className="group bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-medium transition-all duration-500 flex items-center gap-3 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
                <ShoppingBag className="size-5" />
                Explore collection
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-gray-900 hover:bg-gray-900 text-gray-900 hover:text-white px-8 py-4 rounded-full font-medium transition-all duration-500 hover:scale-[1.02]">
                Our brands
              </button>
            </div>

            {/* Boutique location */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="size-5 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-medium">Visit our boutique</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Nevsky Prospect, 114-116, St. Petersburg
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Product Slider */}
          <div className="relative lg:h-[550px] flex items-center justify-center">
            {/* Slider wrapper with floating animation */}
            <div className="relative w-full max-w-md mx-auto animate-float pb-12">
              {/* Shadow/reflection */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gray-900/5 rounded-full blur-xl"></div>
              
              {/* Product Slider */}
              <div className="relative z-10 px-4">
                <Slider {...sliderSettings}>
                  {products.map((product) => (
                    <div key={product.id} className="outline-none">
                      <div className="flex flex-col items-center">
                        <div className="w-full max-w-xs mx-auto">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-[320px] object-cover mx-auto drop-shadow-2xl rounded-lg"
                          />
                        </div>
                        <div className="mt-6 text-center bg-white/90 backdrop-blur-sm py-4 px-8 rounded-xl shadow-lg w-full max-w-xs mx-auto">
                          <h3 className="text-lg font-light text-gray-900">{product.name}</h3>
                          <p className="text-xl font-normal text-amber-700 mt-1">{product.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>

              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 size-24 border-2 border-amber-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-8 -left-8 size-20 border-2 border-purple-200 rounded-full opacity-60"></div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute top-1/4 -left-4 bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-100 animate-float-delay-1">
              <div className="text-xs text-gray-500">Premium Quality</div>
              <div className="text-xl font-light text-gray-900">100%</div>
            </div>

            <div className="absolute bottom-1/3 -right-4 bg-white px-5 py-3 rounded-xl shadow-lg border border-gray-100 animate-float-delay-2">
              <div className="text-xs text-gray-500">Collections</div>
              <div className="text-xl font-light text-gray-900">500+</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

_**Продолжение следует в следующем сообщении...**_ 

(Файл слишком длинный, я создам отдельные файлы для каждого компонента)
