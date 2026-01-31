'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  LogOut,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowSearchResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleResultClick = (slug: string) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(`/catalog/${slug}`);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    setIsUserMenuOpen(false);
  };

  const navLinkClass =
    'text-gray-300 hover:text-[#D4830F] transition-all duration-300 relative group text-[15px] font-medium';
  const navUnderline =
    'absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#D4830F] to-amber-400 group-hover:w-full transition-all duration-300 shadow-[0_0_10px_rgba(212,131,15,0.5)]';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 ${
        isScrolled ? 'shadow-2xl shadow-black/30' : 'shadow-xl shadow-black/20'
      }`}
    >
      {/* Top bar — тёмная версия */}
      <div
        className={`border-b border-white/10 transition-all duration-500 ${
          isScrolled ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-20 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center gap-6">
              <a
                href="tel:8-800-500-87-29"
                className="flex items-center gap-2 text-gray-400 hover:text-[#D4830F] transition-all duration-300 group"
              >
                <Phone className="size-4 group-hover:scale-110 transition-transform" />
                <span>8-800-500-87-29</span>
              </a>
              <span className="flex items-center gap-2 text-gray-400">
                <MapPin className="size-4" />
                <span>Санкт-Петербург, Невский пр., 114-116</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/about" className="text-gray-400 hover:text-[#D4830F] transition-colors">
                О нас
              </Link>
              <Link href="/delivery" className="text-gray-400 hover:text-[#D4830F] transition-colors">
                Доставка
              </Link>
              <Link href="/contacts" className="text-gray-400 hover:text-[#D4830F] transition-colors">
                Контакты
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header — тёмная версия */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="flex items-center justify-between py-4">
          {/* Logo — светлый (инвертированный) с золотым свечением при hover */}
          <Link href="/" className="flex-shrink-0 group cursor-pointer">
            <Image
              src="/logo-idylle.png"
              alt="AROMA Boutique IDYLLE"
              width={220}
              height={82}
              className="h-12 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(212,131,15,0.6)] brightness-0 invert"
              priority
            />
          </Link>

          {/* Search bar — glassmorphism на тёмном фоне */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-12">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                placeholder="Поиск ароматов"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-5 pr-14 py-3.5 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4830F] focus:border-[#D4830F] transition-all bg-white/10 backdrop-blur-md group-hover:bg-white/15 group-hover:border-[#D4830F]/50 text-white placeholder:text-gray-400"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4830F] to-amber-500 text-white p-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#D4830F]/40 h-9 w-9"
              >
                <Search className="size-5" />
              </Button>
              {showSearchResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50 text-gray-900">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">Поиск...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleResultClick(product.slug)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">
                              {product.brand} • {product.category}
                            </div>
                            <div className="text-sm font-semibold text-[#D4830F] mt-1">
                              {new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0 }).format(product.price)} ₽
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t p-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSearchResults(false);
                            router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`);
                          }}
                          className="w-full text-center text-sm text-[#D4830F] hover:underline"
                        >
                          Показать все результаты для «{searchQuery}»
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">Ничего не найдено</div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Actions — светлые иконки на тёмном фоне */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/wishlist"
              className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 group"
            >
              <Heart className="size-6 text-gray-300 group-hover:text-[#D4830F] group-hover:scale-110 transition-all" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs size-5 flex items-center justify-center rounded-full font-medium shadow-lg shadow-red-500/30">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 group relative"
            >
              <ShoppingCart className="size-6 text-gray-300 group-hover:text-[#D4830F] group-hover:scale-110 transition-all" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs size-5 flex items-center justify-center rounded-full font-medium shadow-lg shadow-red-500/30">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="relative user-menu-container">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 group"
              >
                <User className="size-6 text-gray-300 group-hover:text-[#D4830F] group-hover:scale-110 transition-all" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 text-gray-900">
                  {session?.user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium">{session.user.name || session.user.email}</p>
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Личный кабинет
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="size-4" />
                        Выйти
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Войти
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Регистрация
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className="md:hidden p-2.5 hover:bg-white/10 rounded-xl text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Меню"
            >
              {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation — тёмная навигация */}
      <nav className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4830F]/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8 py-5 flex-wrap">
            <Link href="/business" className={navLinkClass}>
              <span>Ароматы для бизнеса</span>
              <span className={navUnderline} />
            </Link>
            <Link href="/aromaty-dlya-doma" className={navLinkClass}>
              <span>Ароматы для дома</span>
              <span className={navUnderline} />
            </Link>
            <Link href="/uyut-i-interer" className={navLinkClass}>
              <span>Уют и интерьер</span>
              <span className={navUnderline} />
            </Link>
            <Link href="/podarki" className={navLinkClass}>
              <span>Подарки</span>
              <span className={navUnderline} />
            </Link>
            <Link href="/vannaya-komnata" className={navLinkClass}>
              <span>Ванная комната</span>
              <span className={navUnderline} />
            </Link>
            <Link href="/dealers" className={navLinkClass}>
              <span>Дилерам</span>
              <span className={navUnderline} />
            </Link>
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent" />
            <Link
              href="/promotions"
              className="text-[#D4830F] hover:text-amber-400 transition-all duration-300 relative group text-[15px] font-bold"
            >
              <span className="relative">
                Акции
                <span className="absolute inset-0 blur-md bg-[#D4830F]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4830F] to-amber-400 shadow-[0_0_10px_rgba(212,131,15,0.6)]" />
            </Link>
            <Link
              href="/sale"
              className="relative text-white transition-all duration-300 group text-[15px] font-bold"
            >
              <span className="relative px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-500 group-hover:from-red-500 group-hover:to-red-400 shadow-lg shadow-red-500/30 group-hover:shadow-xl group-hover:shadow-red-500/50 group-hover:scale-105 inline-block transition-all duration-300">
                Распродажа 🔥
              </span>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4830F]/30 to-transparent" />
      </nav>

      {/* Mobile menu — тёмная версия */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/98">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск ароматов"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4830F] focus:border-[#D4830F]"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-[#D4830F] to-amber-500 text-white rounded-lg hover:opacity-90"
                >
                  <Search className="size-4" />
                </Button>
              </div>
            </form>
            <nav className="space-y-1">
              <Link href="/business" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-300 hover:text-[#D4830F] border-b border-white/10 transition-colors">
                Ароматы для бизнеса
              </Link>
              <Link href="/aromaty-dlya-doma" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-300 hover:text-[#D4830F] border-b border-white/10 transition-colors">
                Ароматы для дома
              </Link>
              <Link href="/uyut-i-interer" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-300 hover:text-[#D4830F] border-b border-white/10 transition-colors">
                Уют и интерьер
              </Link>
              <Link href="/podarki" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-300 hover:text-[#D4830F] border-b border-white/10 transition-colors">
                Подарки
              </Link>
              <Link href="/vannaya-komnata" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-300 hover:text-[#D4830F] border-b border-white/10 transition-colors">
                Ванная комната
              </Link>
              <Link href="/dealers" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-300 hover:text-[#D4830F] border-b border-white/10 transition-colors">
                Дилерам
              </Link>
              <Link href="/promotions" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 font-semibold text-[#D4830F] border-b border-white/10">
                Акции
              </Link>
              <Link href="/sale" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 font-semibold text-red-400 hover:text-red-300 border-b border-white/10">
                Распродажа
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
