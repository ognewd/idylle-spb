import { Search, Heart, ShoppingCart, User, Phone, MapPin, Truck, Gift, ArrowRight, Facebook, Instagram, Twitter, Youtube, Mail, Clock, BookOpen } from "lucide-react";

function Header() {
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
            <div className="text-3xl font-light tracking-wider">
              <span className="text-gray-900">AROMA</span>
              <span className="text-amber-600"> Boutique</span>
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

function HeroSection() {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-[#FFF9F0] via-[#F8F8F8] to-[#FFF9F0] py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Левая колонка - текст (3 колонки из 5 = 60%) */}
          <div className="lg:col-span-3 space-y-8 animate-fade-in z-10">
            {/* Заголовок */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-[#1a1a1a] leading-[1.1] tracking-tight">
              The world of{" "}
              <span className="text-[#D4830F] font-normal">fragrances</span>{" "}
              begins here
            </h1>
            {/* Подзаголовок */}
            <p className="text-lg sm:text-xl text-[#6B7280] max-w-xl leading-relaxed">
              Discover exclusive collections from world-renowned brands and create your unique atmosphere
            </p>
            {/* Кнопки */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#D4830F] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <BookOpen className="size-5" />
                <span>Explore collection</span>
              </a>
              <a
                href="#brands"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1a1a1a] border-2 border-gray-200 hover:border-[#D4830F] hover:text-[#D4830F] px-8 py-4 rounded-full font-medium transition-all duration-300"
              >
                <span>Our brands</span>
              </a>
            </div>
            {/* Адрес бутика */}
            <div className="flex items-start gap-3 pt-4">
              <MapPin className="size-5 text-[#D4830F] flex-shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="font-semibold text-[#1a1a1a]">Our boutique</p>
                <p className="text-sm text-[#6B7280]">
                  Nevsky Prospect, 114-116, Nevsky Center, 4th floor
                </p>
              </div>
            </div>
          </div>

          {/* Правая колонка - просто изображение товара БЕЗ карточки (как в Figma) */}
          <div className="lg:col-span-2 relative flex justify-center lg:justify-end animate-slide-up">
            {/* Желтый бейдж "100% Premium Quality" */}
            <div className="absolute -top-4 right-0 lg:right-0 z-20 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-6 py-3 rounded-full font-medium shadow-xl animate-bounce-slow">
              100% Premium Quality
            </div>
            {/* Изображение товара (диффузор) - без белой карточки */}
            <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1617351165959-471f874b60a9?w=800&q=80"
                alt="Luxury home fragrance diffuser"
                className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Декоративные элементы фона */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#FFE4B5] rounded-full blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#FFA500] rounded-full blur-3xl opacity-10 animate-float-delayed"></div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: "Free shipping",
      description: "We deliver orders in St. Petersburg for free with purchases over 15,000₽.",
    },
    {
      icon: MapPin,
      title: "Boutique in the center",
      description: "Visit our boutique in the center of St. Petersburg to personally experience the fragrances.",
    },
    {
      icon: Gift,
      title: "Gift wrapping",
      description: "Beautiful gift wrapping for your orders at no extra charge.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="mb-6">
                  <div className="size-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="size-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const categories = [
    {
      title: "Luxury Perfumes",
      description: "Exquisite fragrances from world-renowned brands",
      image: "https://images.unsplash.com/photo-1760113559708-84e7a148ec68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlJTIwZWxlZ2FudHxlbnwxfHx8fDE3Njk2OTUzNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "from-rose-500/80 to-pink-600/80"
    },
    {
      title: "Home Fragrances",
      description: "Transform your space with elegant scents",
      image: "https://images.unsplash.com/photo-1660853142045-a74bc7d4e07b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwZnJhZ3JhbmNlJTIwZGlmZnVzZXJ8ZW58MXx8fHwxNzY5NzAyMTAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "from-emerald-500/80 to-teal-600/80"
    },
    {
      title: "Spa & Bathroom",
      description: "Create a luxurious wellness experience",
      image: "https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHNwYXxlbnwxfHx8fDE3Njk2MjMzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "from-amber-500/80 to-yellow-600/80"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900">
            Explore <span className="font-normal">Categories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our curated collections of premium fragrances and home goods
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl aspect-[3/4] cursor-pointer"
            >
              {/* Background image */}
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <h3 className="text-3xl font-light mb-2 transform group-hover:translate-y-0 transition-transform duration-300">
                  {category.title}
                </h3>
                <p className="text-white/90 mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {category.description}
                </p>
                <button className="flex items-center gap-2 text-white font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                  <span>Shop Now</span>
                  <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductGallery() {
  const products = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1760113559708-84e7a148ec68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlJTIwZWxlZ2FudHxlbnwxfHx8fDE3Njk2OTUzNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Velvet Noir",
      category: "Eau de Parfum",
      price: "24,500₽",
      featured: true
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1737920459846-2d0318700658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZnJhZ3JhbmNlJTIwYm90dGxlJTIwZ29sZHxlbnwxfHx8fDE3Njk3MTUwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Golden Essence",
      category: "Luxury Collection",
      price: "32,900₽"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1694179023466-cb438ce7ae0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHBlcmZ1bWUlMjBib3R0bGUlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzY5NzE1MDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Pure Elegance",
      category: "Limited Edition",
      price: "28,700₽"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1617351165959-471f874b60a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob21lJTIwZnJhZ3JhbmNlJTIwZGlmZnVzZXJ8ZW58MXx8fHwxNzY5NzA3ODAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Amber Dream",
      category: "Home Fragrance",
      price: "15,800₽"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYW5kbGUlMjBnb2xkfGVufDF8fHx8MTc2OTcwNzgwMXww&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Royal Candle",
      category: "Premium Candles",
      price: "8,900₽"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1592413999705-38c623ec5de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHByb2R1Y3RzfGVufDF8fHx8MTc2OTcwNzgwMXww&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Spa Collection",
      category: "Bath & Body",
      price: "12,500₽"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900">
            Featured <span className="font-normal">Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked selection of our most luxurious fragrances and home essentials
          </p>
        </div>

        {/* Products grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
            >
              {/* Image container */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.featured && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                    Featured
                  </div>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span>View Details</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Product info */}
              <div className="p-6 space-y-2">
                <p className="text-sm text-amber-600 font-medium">{product.category}</p>
                <h3 className="text-xl font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-2xl font-light text-gray-900">{product.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 rounded-full font-medium transition-all duration-300 inline-flex items-center gap-3 group">
            <span>View All Products</span>
            <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
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
            <div className="text-3xl font-light tracking-wider">
              <span className="text-gray-900">AROMA</span>
              <span className="text-amber-600"> Boutique</span>
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
              <a href="mailto:info@idylle.spb.ru" className="flex items-start gap-3 text-gray-600 hover:text-amber-600 transition-colors group">
                <Mail className="size-5 mt-0.5 flex-shrink-0" />
                <span>info@idylle.spb.ru</span>
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
            <p>© 2026 AROMA BOUTIQUE IDYLLE. All rights reserved.</p>
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

export default function App() {
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
