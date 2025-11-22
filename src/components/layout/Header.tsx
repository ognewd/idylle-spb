'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X,
  Phone,
  MapPin,
  Sparkles,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export function Header() {
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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    setIsUserMenuOpen(false);
  };

  // Close menu when clicking outside
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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Search products with debounce
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
      } catch (error) {
        console.error('Search error:', error);
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>+7 (812) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Санкт-Петербург</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/about" className="hover:text-primary transition-colors">
                О нас
              </Link>
              <Link href="/delivery" className="hover:text-primary transition-colors">
                Доставка
              </Link>
              <Link href="/contacts" className="hover:text-primary transition-colors">
                Контакты
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo-idylle.png" 
              alt="Idylle" 
              width={220} 
              height={82}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Поиск парфюмов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      Поиск...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
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
                            <div className="font-medium text-sm truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.brand} • {product.category}
                            </div>
                            <div className="text-sm font-semibold text-primary mt-1">
                              {new Intl.NumberFormat('ru-RU', {
                                style: 'currency',
                                currency: 'RUB',
                                minimumFractionDigits: 0,
                              }).format(product.price)}
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t p-2">
                        <button
                          onClick={handleSearch}
                          className="w-full text-center text-sm text-primary hover:underline"
                        >
                          Показать все результаты для "{searchQuery}"
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Ничего не найдено
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {/* TODO: Open mobile search */}}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {wishlistItems.length}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Account */}
            <div className="relative user-menu-container">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="h-5 w-5" />
              </Button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {session?.user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user.name || session.user.email}
                        </p>
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
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
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

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center flex-wrap gap-x-6 gap-y-2 py-4 border-t">
          <Link href="/business" className="hover:text-primary transition-colors">
            Ароматы для бизнеса
          </Link>
          <Link href="/aromaty-dlya-doma" className="hover:text-primary transition-colors">
            Ароматы для дома
          </Link>
          <Link href="/uyut-i-interer" className="hover:text-primary transition-colors">
            Уют и интерьер
          </Link>
          <Link href="/podarki" className="hover:text-primary transition-colors">
            Подарки
          </Link>
          <Link href="/dealers" className="hover:text-primary transition-colors">
            Дилерам
          </Link>
          <Link href="/promotions" className="hover:text-primary transition-colors font-semibold text-orange-600">
            Акции
          </Link>
          <Link href="/sale" className="hover:text-primary transition-colors font-semibold text-red-600">
            Распродажа
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Поиск парфюмов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Search Results Dropdown */}
              {showSearchResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      Поиск...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
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
                            <div className="font-medium text-sm truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.brand} • {product.category}
                            </div>
                            <div className="text-sm font-semibold text-primary mt-1">
                              {new Intl.NumberFormat('ru-RU', {
                                style: 'currency',
                                currency: 'RUB',
                                minimumFractionDigits: 0,
                              }).format(product.price)}
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="border-t p-2">
                        <button
                          onClick={handleSearch}
                          className="w-full text-center text-sm text-primary hover:underline"
                        >
                          Показать все результаты для "{searchQuery}"
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Ничего не найдено
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-1">
              <Link 
                href="/business" 
                className="block py-2 hover:text-primary transition-colors border-b"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ароматы для бизнеса
              </Link>
              <Link 
                href="/aromaty-dlya-doma" 
                className="block py-2 hover:text-primary transition-colors border-b"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ароматы для дома
              </Link>
              <Link 
                href="/uyut-i-interer" 
                className="block py-2 hover:text-primary transition-colors border-b"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Уют и интерьер
              </Link>
              <Link 
                href="/podarki" 
                className="block py-2 hover:text-primary transition-colors border-b"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Подарки
              </Link>
              <Link 
                href="/dealers" 
                className="block py-2 hover:text-primary transition-colors border-b"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Дилерам
              </Link>
              <Link 
                href="/promotions" 
                className="block py-2 font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Акции
              </Link>
              <Link 
                href="/sale" 
                className="block py-2 font-semibold text-red-600 hover:text-red-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Распродажа
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="pt-4 border-t space-y-2">
              <Link 
                href="/account" 
                className="flex items-center space-x-2 py-2 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Личный кабинет</span>
              </Link>
              <Link 
                href="/wishlist" 
                className="flex items-center space-x-2 py-2 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                <span>Избранное</span>
              </Link>
              <Link 
                href="/cart" 
                className="flex items-center space-x-2 py-2 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Корзина</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
