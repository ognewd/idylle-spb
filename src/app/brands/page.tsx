'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Search, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

// Алфавит для фильтрации
const LATIN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CYRILLIC_ALPHABET = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ'.split('');

// Функция для определения первой буквы бренда
function getFirstChar(name: string): string {
  const firstChar = name.trim().charAt(0).toUpperCase();
  
  // Проверяем, является ли это латинской буквой
  if (/[A-Z]/.test(firstChar)) {
    return firstChar;
  }
  
  // Проверяем, является ли это кириллической буквой
  if (/[А-ЯЁ]/.test(firstChar)) {
    return firstChar === 'Ё' ? 'Е' : firstChar;
  }
  
  // Проверяем, является ли это цифрой
  if (/[0-9]/.test(firstChar)) {
    return '0-9';
  }
  
  // Все остальное (спецсимволы) идет в 0-9
  return '0-9';
}

// Группировка брендов по первой букве
function groupBrandsByLetter(brands: Brand[]): Map<string, Brand[]> {
  const grouped = new Map<string, Brand[]>();
  
  brands.forEach(brand => {
    const letter = getFirstChar(brand.name);
    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }
    grouped.get(letter)!.push(brand);
  });
  
  // Сортируем бренды внутри каждой группы
  grouped.forEach((brands, letter) => {
    brands.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  });
  
  return grouped;
}

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Загрузка брендов
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/brands');
        if (response.ok) {
          const data = await response.json();
          // Фильтруем только бренды с товарами (дополнительная проверка на клиенте)
          const brandsWithProducts = data.filter((brand: Brand) => brand.productCount > 0);
          setBrands(brandsWithProducts);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Группировка брендов
  const groupedBrands = useMemo(() => {
    return groupBrandsByLetter(brands);
  }, [brands]);

  // Фильтрация по выбранной букве и поисковому запросу
  const filteredBrands = useMemo(() => {
    let filtered = brands;

    // Фильтр по букве
    if (selectedLetter !== 'ALL') {
      filtered = filtered.filter(brand => {
        const firstChar = getFirstChar(brand.name);
        if (selectedLetter === '0-9') {
          return firstChar === '0-9';
        }
        if (selectedLetter === 'А-Я') {
          return CYRILLIC_ALPHABET.includes(firstChar);
        }
        return firstChar === selectedLetter;
      });
    }

    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [brands, selectedLetter, searchQuery]);

  // Обработка клика по бренду
  const handleBrandClick = (brandSlug: string) => {
    router.push(`/catalog?filter_brand=${brandSlug}`);
  };

  // Получение списка букв, для которых есть бренды
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    brands.forEach(brand => {
      const firstChar = getFirstChar(brand.name);
      if (firstChar === '0-9') {
        letters.add('0-9');
      } else if (CYRILLIC_ALPHABET.includes(firstChar)) {
        letters.add('А-Я');
      } else {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  }, [brands]);

  // Проверка наличия брендов для буквы
  const hasBrandsForLetter = (letter: string): boolean => {
    if (letter === 'ALL') return true;
    if (letter === '0-9') {
      return brands.some(b => getFirstChar(b.name) === '0-9');
    }
    if (letter === 'А-Я') {
      return brands.some(b => {
        const firstChar = getFirstChar(b.name);
        return CYRILLIC_ALPHABET.includes(firstChar);
      });
    }
    return brands.some(b => getFirstChar(b.name) === letter);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Бренды', href: '/brands' },
          ]}
        />

        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ДИЗАЙНЕРЫ И БРЕНДЫ</h1>
          <p className="text-muted-foreground">
            Выберите бренд, чтобы увидеть все товары
          </p>
        </div>

        {/* Поиск и выбор бренда */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск бренда..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={searchQuery || undefined} onValueChange={(value) => {
            if (value) {
              const brand = brands.find(b => b.slug === value);
              if (brand) {
                handleBrandClick(brand.slug);
              }
            }
          }}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Нажмите для выбора" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.slug}>
                  {brand.name} {brand.productCount > 0 && `(${brand.productCount})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Алфавитная фильтрация */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Кнопка "ВСЕ" */}
            <Button
              variant={selectedLetter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLetter('ALL')}
              className="min-w-[60px]"
            >
              ВСЕ
            </Button>

            {/* Латинский алфавит */}
            {LATIN_ALPHABET.map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLetter(letter)}
                disabled={!hasBrandsForLetter(letter)}
                className="min-w-[40px] disabled:opacity-30"
              >
                {letter}
              </Button>
            ))}

            {/* Цифры */}
            <Button
              variant={selectedLetter === '0-9' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLetter('0-9')}
              disabled={!hasBrandsForLetter('0-9')}
              className="min-w-[60px] disabled:opacity-30"
            >
              0-9
            </Button>

            {/* Кириллический алфавит */}
            <Button
              variant={selectedLetter === 'А-Я' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLetter('А-Я')}
              disabled={!hasBrandsForLetter('А-Я')}
              className="min-w-[60px] disabled:opacity-30"
            >
              А-Я
            </Button>
          </div>
        </div>

        {/* Список брендов */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Загрузка брендов...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? `Бренды по запросу "${searchQuery}" не найдены`
                : 'Бренды не найдены'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Если выбрана конкретная буква, показываем только её бренды */}
            {selectedLetter !== 'ALL' && !searchQuery ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {selectedLetter === '0-9'
                    ? '0–9'
                    : selectedLetter === 'А-Я'
                    ? 'А–Я'
                    : selectedLetter}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBrands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleBrandClick(brand.slug)}
                      className="text-left p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {brand.name}
                        </span>
                        {brand.productCount > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({brand.productCount})
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Если выбрано "ВСЕ" или есть поиск, показываем все бренды
              <div>
                {selectedLetter === 'ALL' && !searchQuery ? (
                  // Группировка по буквам для режима "ВСЕ"
                  Array.from(groupedBrands.entries())
                    .sort(([a], [b]) => {
                      if (a === '0-9') return -1;
                      if (b === '0-9') return 1;
                      if (a === 'А-Я') return 1;
                      if (b === 'А-Я') return -1;
                      return a.localeCompare(b);
                    })
                    .map(([letter, letterBrands]) => (
                      <div key={letter} className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                          {letter === '0-9' ? '0–9' : letter === 'А-Я' ? 'А–Я' : letter}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {letterBrands.map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => handleBrandClick(brand.slug)}
                              className="text-left p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium group-hover:text-primary transition-colors">
                                  {brand.name}
                                </span>
                                {brand.productCount > 0 && (
                                  <span className="text-sm text-muted-foreground">
                                    ({brand.productCount})
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                ) : (
                  // Простой список для поиска
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBrands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandClick(brand.slug)}
                        className="text-left p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium group-hover:text-primary transition-colors">
                            {brand.name}
                          </span>
                          {brand.productCount > 0 && (
                            <span className="text-sm text-muted-foreground">
                              ({brand.productCount})
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Сообщение если нет нужного бренда */}
        {!loading && brands.length > 0 && (
          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-muted-foreground mb-2">Нет нужного бренда?</p>
            <Button variant="outline" asChild>
              <a href="mailto:info@idylle.spb.ru">Свяжитесь с нами</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
