'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Phone,
  Mail,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getImageUrl } from '@/lib/image-url';

const PROMO_DISMISS_KEY = 'header-promo-dismissed';
/** Раскрытая шапка только при scrollY < EXPAND; схлопнутая при scrollY > COLLAPSE. Большой зазор убирает дрожание при скролле вверх. */
const SCROLL_EXPAND = 8;
const SCROLL_COLLAPSE = 80;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [promoClosed, setPromoClosed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    let expandTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > SCROLL_COLLAPSE) {
          expandTimer && clearTimeout(expandTimer);
          expandTimer = null;
          setIsScrolled(true);
        } else if (y < SCROLL_EXPAND) {
          if (expandTimer == null) {
            expandTimer = setTimeout(() => {
              setIsScrolled(false);
              expandTimer = null;
            }, 120);
          }
        } else {
          expandTimer && clearTimeout(expandTimer);
          expandTimer = null;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (expandTimer) clearTimeout(expandTimer);
    };
  }, []);

  useEffect(() => {
    try {
      setPromoClosed(localStorage.getItem(PROMO_DISMISS_KEY) === '1');
    } catch {
      setPromoClosed(false);
    }
  }, []);

  const closePromo = () => {
    setPromoClosed(true);
    try {
      localStorage.setItem(PROMO_DISMISS_KEY, '1');
    } catch {}
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) setIsUserMenuOpen(false);
    };
    if (isUserMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowSearchResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
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
    setIsSearchOpen(false);
    router.push(`/catalog/${slug}`);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      {/* При скролле — компактная строка: лого | поиск | иконки */}
      {isScrolled ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 gap-4">
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo-idylle.png" alt="Idylle" width={100} height={38} className="h-8 w-auto" />
            </Link>
            <div className="hidden md:flex flex-1 max-w-md mx-auto">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Найти аромат..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50/80 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-gray-300"
                />
                {showSearchResults && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-lg max-h-72 overflow-y-auto z-50 rounded-lg">
                    {isSearching ? <div className="p-4 text-center text-gray-500 text-sm">Поиск...</div> : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((product) => (
                          <button key={product.id} type="button" onClick={() => handleResultClick(product.slug)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left">
                            <div className="relative w-9 h-9 flex-shrink-0 rounded overflow-hidden">
                              <Image src={getImageUrl(product.image)} alt={product.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.brand} • {new Intl.NumberFormat('ru-RU').format(product.price)} ₽</div>
                            </div>
                          </button>
                        ))}
                        <div className="border-t border-gray-100 p-2">
                          <button type="button" onClick={() => { setShowSearchResults(false); router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`); }} className="w-full text-center text-sm text-gray-600 hover:text-black">Все результаты</button>
                        </div>
                      </>
                    ) : <div className="p-4 text-center text-gray-500 text-sm">Ничего не найдено</div>}
                  </div>
                )}
              </form>
            </div>
            <div className="flex items-center gap-0 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2 text-gray-800 hover:text-black transition-colors"
                aria-label="Поиск"
              >
                <Search className="size-5" strokeWidth={1.5} />
              </button>
              <Link href="/wishlist" className="relative p-2 text-gray-800 hover:text-black" aria-label="Избранное">
                <Heart className="size-5" strokeWidth={1.5} />
                {wishlistItems.length > 0 && <span className="absolute top-1 right-1 size-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">{wishlistItems.length}</span>}
              </Link>
              <Link href="/cart" className="relative p-2 text-gray-800 hover:text-black" aria-label="Корзина">
                <ShoppingCart className="size-5" strokeWidth={1.5} />
                {totalItems > 0 && <span className="absolute top-1 right-1 size-4 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center">{totalItems}</span>}
              </Link>
              <div className="relative user-menu-container">
                <button type="button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-2 text-gray-800 hover:text-black" aria-label="Профиль">
                  <User className="size-5" strokeWidth={1.5} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 shadow-lg py-2 z-50">
                    {session?.user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{session.user.name || session.user.email}</p>
                          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                        </div>
                        <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50">Личный кабинет</Link>
                        <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut className="size-4" /> Выйти</button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/signin" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50">Войти</Link>
                        <Link href="/auth/signup" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50">Регистрация</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button type="button" className="md:hidden p-2 text-gray-800 hover:text-black" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={isMobileMenuOpen ? 'Закрыть' : 'Меню'}>
                {isMobileMenuOpen ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Верхняя полоса: телефон и email слева, О нас / Доставка / Контакты справа (без фона) */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] sm:text-xs text-gray-500 tracking-wide">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <a href="tel:88005008729" className="flex items-center gap-1.5 hover:text-black transition-colors">
                <Phone className="size-3.5 sm:size-4" />
                8 (800) 500-87-29
              </a>
              <a href="mailto:info@idylle.spb.ru" className="flex items-center gap-1.5 hover:text-black transition-colors">
                <Mail className="size-3.5 sm:size-4" />
                info@idylle.spb.ru
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-black transition-colors">О нас</Link>
              <Link href="/delivery" className="hover:text-black transition-colors">Доставка</Link>
              <Link href="/contacts" className="hover:text-black transition-colors">Контакты</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Промо-баннер — скрыт если закрыт */}
      {!promoClosed && (
        <div className="bg-[#f5f5f5] border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center">
            <div className="flex-1 text-center">
              <p className="text-gray-800 text-sm">Получите подарок при заказе от 5000₽ по коду IDYLLE10</p>
            </div>
            <button type="button" onClick={closePromo} className="flex-shrink-0 p-1.5 text-gray-500 hover:text-black transition-colors" aria-label="Закрыть">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Основной ряд: лого+слоган слева | поиск по центру | иконки справа */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-4">
          {/* Слева — логотип + слоган */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-idylle.png"
              alt="Idylle"
              width={140}
              height={52}
              className="h-9 w-auto sm:h-10 md:h-11"
              priority
            />
          </Link>

          {/* Центр — развёрнутый поиск (только десктоп) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto px-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Найти аромат, свечу или диффузор..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/80 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-gray-300 focus:bg-white"
              />
              {showSearchResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-lg max-h-80 overflow-y-auto z-50 rounded-lg">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Поиск...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleResultClick(product.slug)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                        >
                          <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                            <Image src={getImageUrl(product.image)} alt={product.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.brand} • {product.category}</div>
                            <div className="text-sm text-gray-700 mt-0.5">{new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0 }).format(product.price)} ₽</div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 p-2">
                        <button type="button" onClick={() => { setShowSearchResults(false); router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`); }} className="w-full text-center text-sm text-gray-600 hover:text-black">Все результаты</button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">Ничего не найдено</div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Справа — поиск (мобиле) + иконки */}
          <div className="flex items-center gap-0 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-800 hover:text-black transition-colors"
              aria-label="Поиск"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </button>
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-800 hover:text-black transition-colors"
              aria-label="Избранное"
            >
              <Heart className="size-5" strokeWidth={1.5} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 size-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative p-2 text-gray-800 hover:text-black transition-colors"
              aria-label="Корзина"
            >
              <ShoppingCart className="size-5" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 size-4 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="relative user-menu-container">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-gray-800 hover:text-black transition-colors"
                aria-label="Профиль"
              >
                <User className="size-5" strokeWidth={1.5} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 shadow-lg py-2 z-50">
                  {session?.user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user.name || session.user.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                      >
                        Личный кабинет
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                      >
                        Войти
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
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
              className="md:hidden p-1.5 text-gray-800 hover:text-black -m-1.5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Меню'}
            >
              {isMobileMenuOpen ? <X className="size-4" strokeWidth={1.5} /> : <Menu className="size-4" strokeWidth={1.5} />}
            </button>
            </div>
          </div>
        </div>

      {/* Навигация — скруглённые кнопки, активное состояние, красная SALE */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="hidden md:flex flex-wrap items-center justify-start gap-2 py-4">
            <Link href="/business" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">Ароматы для бизнеса</Link>
            <Link href="/aromaty-dlya-doma" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">Ароматы для дома</Link>
            <Link href="/uyut-i-interer" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">Уют и интерьер</Link>
            <Link href="/vannaya-komnata" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">Ванная комната</Link>
            <Link href="/podarki" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">Подарки</Link>
            <Link href="/dealers" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">Дилерам</Link>
            <Link href="/brands" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">Бренды</Link>
            <Link href="/sale" className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">SALE</Link>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            <form onSubmit={handleSearch} className="pb-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 border border-gray-200 text-base focus:outline-none focus:border-gray-400"
                />
                <Button type="submit" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0">
                  <Search className="size-4" />
                </Button>
              </div>
            </form>
            <Link href="/business" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Ароматы для бизнеса</Link>
            <Link href="/aromaty-dlya-doma" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Ароматы для дома</Link>
            <Link href="/uyut-i-interer" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Уют и интерьер</Link>
            <Link href="/vannaya-komnata" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Ванная комната</Link>
            <Link href="/podarki" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Подарки</Link>
            <Link href="/dealers" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Дилерам</Link>
            <Link href="/brands" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Бренды</Link>
            <Link href="/sale" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-red-600 text-sm hover:underline">SALE</Link>
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">О нас</Link>
              <Link href="/delivery" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Доставка</Link>
              <Link href="/contacts" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Контакты</Link>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Строка поиска (при клике на лупу — и при скролле тоже) */}
      {isSearchOpen && (
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-2xl mx-auto px-4 py-3 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Поиск ароматов"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:border-gray-400"
                autoFocus
              />
              <Button type="submit" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-600">
                <Search className="size-4" />
              </Button>
            </form>
            {showSearchResults && (searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-100 shadow-lg max-h-80 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Поиск...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleResultClick(product.slug)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                      >
                        <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                          <Image src={getImageUrl(product.image)} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.brand} • {product.category}</div>
                          <div className="text-sm text-gray-700 mt-0.5">{new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0 }).format(product.price)} ₽</div>
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-gray-100 p-2">
                      <button type="button" onClick={() => { setShowSearchResults(false); setIsSearchOpen(false); router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`); }} className="w-full text-center text-sm text-gray-600 hover:text-black">Все результаты для «{searchQuery}»</button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">Ничего не найдено</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
