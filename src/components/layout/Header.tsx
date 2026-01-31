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
  LogOut,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

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

  const navLink =
    'text-gray-800 text-[13px] tracking-wide hover:text-black hover:underline transition-colors duration-200';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      {/* При скролле — одна строка: поиск слева, меню по центру, иконки справа */}
      {isScrolled ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 gap-2">
            {/* Слева: на мобиле лого, на десктопе поиск */}
            <div className="flex items-center flex-shrink-0 gap-2">
              <Link href="/" className="md:hidden flex-shrink-0">
                <Image src="/logo-idylle.png" alt="Idylle" width={120} height={45} className="h-8 w-auto max-w-[100px]" />
              </Link>
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden md:block flex-shrink-0 p-2 text-gray-800 hover:text-black transition-colors"
                aria-label="Поиск"
              >
                <Search className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="hidden md:flex items-center justify-center gap-x-4 lg:gap-x-6 flex-1 min-w-0 [&>a]:mr-4 [&>a]:last:mr-0 lg:[&>a]:mr-6">
              <Link href="/business" className={navLink}>Ароматы для бизнеса</Link>
              <Link href="/aromaty-dlya-doma" className={navLink}>Ароматы для дома</Link>
              <Link href="/uyut-i-interer" className={navLink}>Уют и интерьер</Link>
              <Link href="/podarki" className={navLink}>Подарки</Link>
              <Link href="/vannaya-komnata" className={navLink}>Ванная комната</Link>
              <Link href="/dealers" className={navLink}>Дилерам</Link>
              <Link href="/promotions" className={navLink}>Акции</Link>
              <Link href="/sale" className={`${navLink} text-red-600 hover:text-red-700`}>SALE</Link>
            </nav>
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
                {wishlistItems.length > 0 && <span className="absolute top-1 right-1 size-4 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center">{wishlistItems.length}</span>}
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
      {/* Промо-баннер — минимализм */}
      {!promoClosed && (
        <div className="bg-[#f5f5f5] border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center">
            <div className="flex-1 text-center">
              <p className="text-gray-800 text-sm">
                Получите подарок при заказе от 5000₽ по коду IDYLLE10
              </p>
            </div>
            <button
              type="button"
              onClick={closePromo}
              className="flex-shrink-0 p-1.5 text-gray-500 hover:text-black transition-colors"
              aria-label="Закрыть"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Основной ряд: на мобиле — лого слева, иконки справа; на десктопе — поиск | лого по центру | О нас + иконки */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2">
          {/* Слева — поиск (только десктоп) */}
          <div className="hidden md:flex items-center flex-shrink-0 w-12">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-800 hover:text-black transition-colors"
              aria-label="Поиск"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Логотип: на мобиле слева, на десктопе по центру */}
          <Link
            href="/"
            className="flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            <Image
              src="/logo-idylle.png"
              alt="Idylle"
              width={180}
              height={67}
              className="h-9 w-auto max-w-[120px] sm:h-10 sm:max-w-[140px] md:h-12 md:max-w-none"
              priority
            />
          </Link>

          {/* Справа — ссылки О нас/Доставка/Контакты над иконками */}
          <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-4 text-[11px] text-gray-500 tracking-wide">
              <Link href="/about" className="hover:text-black transition-colors">О нас</Link>
              <Link href="/delivery" className="hover:text-black transition-colors">Доставка</Link>
              <Link href="/contacts" className="hover:text-black transition-colors">Контакты</Link>
            </div>
            <div className="flex items-center gap-0">
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-800 hover:text-black transition-colors"
              aria-label="Избранное"
            >
              <Heart className="size-5" strokeWidth={1.5} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 size-4 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center">
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
          {/* На мобиле — лого уже слева; справа поиск + иконки с нормальными размерами */}
          <div className="flex md:hidden items-center gap-0 flex-shrink-0 ml-auto">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-800 hover:text-black transition-colors"
              aria-label="Поиск"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </button>
            <Link href="/wishlist" className="relative p-2 text-gray-800 hover:text-black" aria-label="Избранное">
              <Heart className="size-5" strokeWidth={1.5} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 size-4 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center">{wishlistItems.length}</span>
              )}
            </Link>
            <Link href="/cart" className="relative p-2 text-gray-800 hover:text-black" aria-label="Корзина">
              <ShoppingCart className="size-5" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 size-4 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center">{totalItems}</span>
              )}
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
                      <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut className="size-4" /> Выйти
                      </button>
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
            <button type="button" className="p-2 text-gray-800 hover:text-black" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Меню'}>
              {isMobileMenuOpen ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Навигация — одна строка, простые ссылки */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="hidden md:flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:gap-x-8 py-4 [&>a]:mr-6 [&>a]:last:mr-0">
            <Link href="/business" className={navLink}>Ароматы для бизнеса</Link>
            <Link href="/aromaty-dlya-doma" className={navLink}>Ароматы для дома</Link>
            <Link href="/uyut-i-interer" className={navLink}>Уют и интерьер</Link>
            <Link href="/podarki" className={navLink}>Подарки</Link>
            <Link href="/vannaya-komnata" className={navLink}>Ванная комната</Link>
            <Link href="/dealers" className={navLink}>Дилерам</Link>
            <Link href="/promotions" className={navLink}>Акции</Link>
            <Link href="/sale" className={`${navLink} text-red-600 hover:text-red-700`}>SALE</Link>
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
            <Link href="/podarki" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Подарки</Link>
            <Link href="/vannaya-komnata" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Ванная комната</Link>
            <Link href="/dealers" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Дилерам</Link>
            <Link href="/promotions" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-gray-800 text-sm hover:underline">Акции</Link>
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
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
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
