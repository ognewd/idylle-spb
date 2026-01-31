# 📦 ВСЕ КОМПОНЕНТЫ - Часть 2

## 3️⃣ FeaturesSection.tsx

**Создайте файл:** `src/components/FeaturesSection.tsx`

```tsx
import { Truck, MapPin, Gift } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: "Free shipping",
      description: "We deliver orders in St. Petersburg for free with purchases over 15,000₽.",
    },
    {
      icon: MapPin,
      title: "Boutique in the city center",
      description: "Visit our boutique in the Nevsky Center shopping center (Stockmann), 4th floor, Nevsky Prospekt, 114–116",
    },
    {
      icon: Gift,
      title: "10% discount on your first order",
      description: "Place your first order and get 10% off your entire cart.",
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-gray-50/50 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative"
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Elegant icon with gold accent */}
                  <div className="relative">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-yellow-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 scale-150"></div>
                    
                    {/* Icon container */}
                    <div className="relative size-20 rounded-full border-2 border-amber-600/20 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 group-hover:border-amber-600/40 transition-all duration-500 group-hover:scale-110">
                      <Icon className="size-9 text-amber-700 group-hover:text-amber-600 transition-colors" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Title with gold accent on hover */}
                  <h3 className="text-xl font-light text-gray-900 group-hover:text-amber-900 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed font-light text-[15px]">
                    {feature.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent group-hover:w-20 transition-all duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

---

## 4️⃣ CategoriesSection.tsx

**Создайте файл:** `src/components/CategoriesSection.tsx`

```tsx
import { ArrowRight } from "lucide-react";

export function CategoriesSection() {
  const categories = [
    {
      title: "Luxury Perfumes",
      description: "Exquisite fragrances from world-renowned brands",
      image: "https://images.unsplash.com/photo-1760113559708-84e7a148ec68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      gradient: "from-rose-500/80 to-pink-600/80"
    },
    {
      title: "Home Fragrances",
      description: "Transform your space with elegant scents",
      image: "https://images.unsplash.com/photo-1660853142045-a74bc7d4e07b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      gradient: "from-emerald-500/80 to-teal-600/80"
    },
    {
      title: "Spa & Bathroom",
      description: "Create a luxurious wellness experience",
      image: "https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      gradient: "from-amber-500/80 to-yellow-600/80"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900">
            Popular categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular fragrance and home collections
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            >
              {/* Background image */}
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 size-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <div className="space-y-3 transform group-hover:translate-y-[-8px] transition-transform duration-300">
                  <h3 className="text-2xl font-medium">
                    {category.title}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {category.description}
                  </p>
                  <button className="inline-flex items-center gap-2 text-white font-medium group/btn mt-2">
                    <span>Explore collection</span>
                    <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Hover border effect */}
              <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-3xl transition-colors duration-300"></div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl group">
            View all categories
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
```

---

## 5️⃣ ProductGallery.tsx

**Создайте файл:** `src/components/ProductGallery.tsx`

```tsx
import { ArrowRight } from "lucide-react";

export function ProductGallery() {
  const products = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1760113559708-84e7a148ec68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      name: "Velvet Noir",
      category: "Eau de Parfum",
      price: "24,500₽",
      featured: true
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1737920459846-2d0318700658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      name: "Golden Essence",
      category: "Luxury Collection",
      price: "32,900₽"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1694179023466-cb438ce7ae0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      name: "Pure Elegance",
      category: "Limited Edition",
      price: "28,700₽"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1617351165959-471f874b60a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      name: "Amber Dream",
      category: "Home Diffuser",
      price: "18,500₽"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1640869116016-93c00ba94b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      name: "Midnight Rose",
      category: "Signature Scent",
      price: "26,300₽"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1759793500112-c588839cfc6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      name: "Crystal Oud",
      category: "Premium Line",
      price: "38,900₽"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 size-96 bg-amber-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 size-96 bg-purple-100/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-600"></div>
              <span className="text-sm tracking-[0.3em] text-amber-700 uppercase">Curated Selection</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-600"></div>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
            Featured <span className="font-normal">Fragrances</span>
          </h2>
          <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
            Discover our handpicked collection of the world's most exquisite perfumes
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-amber-200"
            >
              {/* Featured badge */}
              {product.featured && (
                <div className="absolute top-4 right-4 z-10 bg-amber-600 text-white px-4 py-1.5 rounded-full text-xs tracking-wider uppercase">
                  Featured
                </div>
              )}

              {/* Image container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <button className="w-full bg-white/95 hover:bg-white text-gray-900 py-3 rounded-full font-light flex items-center justify-center gap-2 group/btn">
                      <span>View Details</span>
                      <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product info */}
              <div className="p-6 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs tracking-[0.2em] text-amber-700 uppercase">
                    {product.category}
                  </p>
                  <h3 className="text-xl font-light text-gray-900 group-hover:text-amber-900 transition-colors">
                    {product.name}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-2xl font-light text-gray-900">{product.price}</span>
                  <div className="size-10 rounded-full border-2 border-gray-200 group-hover:border-amber-600 flex items-center justify-center transition-colors">
                    <ArrowRight className="size-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <button className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-amber-900 text-white px-10 py-4 rounded-full transition-all duration-500 hover:shadow-xl hover:scale-105">
            <span className="font-light tracking-wide">View All Collection</span>
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
```

---

## 6️⃣ Footer.tsx

**Создайте файл:** `src/components/Footer.tsx`

```tsx
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      {/* Newsletter section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3 text-white">
              <Mail className="size-8" />
              <h3 className="text-3xl font-light">Subscribe to news</h3>
            </div>
            <p className="text-gray-300">
              Get exclusive offers and be the first to know about new collections
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-6 py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-medium transition-colors duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <label className="flex items-center justify-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span>I agree to receive news and special offers</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Company info */}
          <div className="space-y-6">
            <div className="text-2xl font-light tracking-tight text-gray-900">
              Aroma <span className="font-normal">Boutique</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Exclusive fragrances and home goods from leading global brands. We create an atmosphere of luxury and comfort in your home.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="size-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-900 text-gray-700 hover:text-white transition-all duration-300">
                <Facebook className="size-5" />
              </a>
              <a href="#" className="size-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-900 text-gray-700 hover:text-white transition-all duration-300">
                <Instagram className="size-5" />
              </a>
              <a href="#" className="size-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-900 text-gray-700 hover:text-white transition-all duration-300">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="size-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-900 text-gray-700 hover:text-white transition-all duration-300">
                <Youtube className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Quick links</h4>
            <ul className="space-y-3">
              {["Catalog", "Brands", "New items", "Sale", "About Us"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Desk */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Help Desk</h4>
            <ul className="space-y-3">
              {[
                "Delivery and payment",
                "Returns and exchanges",
                "Size chart",
                "Frequently asked questions",
                "Contacts"
              ].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-amber-600 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Contacts</h4>
            <div className="space-y-4">
              <a href="tel:8-800-500-87-29" className="flex items-start gap-3 text-gray-600 hover:text-amber-600 transition-colors group">
                <Phone className="size-5 mt-0.5 flex-shrink-0" />
                <span>8-800-500-87-29</span>
              </a>
              <a href="mailto:info@aromaboutique.ru" className="flex items-start gap-3 text-gray-600 hover:text-amber-600 transition-colors group">
                <Mail className="size-5 mt-0.5 flex-shrink-0" />
                <span>info@aromaboutique.ru</span>
              </a>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="size-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div>St. Petersburg,</div>
                  <div>Nevsky Prospect, 114-116</div>
                  <div className="text-sm text-gray-500">Nevsky Center Shopping Mall, 4th floor</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <Clock className="size-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Mon-Sun: 10:00 - 23:00</div>
                  <div className="text-sm text-gray-500">(seven days a week)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-sm text-gray-600">Help with ordering:</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  WhatsApp
                </button>
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Telegram
                </button>
              </div>
              <p className="text-sm text-gray-600">8-921-599-00-90</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2026 Aroma Boutique. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-amber-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-amber-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

_Продолжение в следующем файле..._
