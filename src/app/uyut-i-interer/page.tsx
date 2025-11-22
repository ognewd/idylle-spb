'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SortSelector } from '@/components/product/SortSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: Array<{ url: string; alt?: string; isPrimary: boolean }>;
  brand: {
    name: string;
    slug: string;
  };
  productCategories: Array<{
    category: {
      name: string;
      slug: string;
    };
  }>;
  volume?: string;
  aromaFamily?: string;
  gender?: string;
  productType?: string;
  purpose?: string;
  country?: string;
  stock: number;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
}

interface Filter {
  id: string;
  name: string;
  type: 'checkbox' | 'range';
  options?: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  min?: number;
  max?: number;
  step?: number;
}

interface ApiResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function HomeCozyContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  });

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch products and filters
  useEffect(() => {
    if (!isMounted) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build query string with filters
        const queryParams = new URLSearchParams();
        queryParams.set('category', 'uyut-i-interer');
        queryParams.set('page', '1');
        queryParams.set('limit', '24');

        // Add filter params from URL
        searchParams.forEach((value, key) => {
          if (key.startsWith('filter_')) {
            queryParams.append(key, value);
          }
        });
        
        // Fetch products and filters
        const [productsResponse, filtersResponse] = await Promise.all([
          fetch(`/api/products?${queryParams.toString()}`),
          fetch('/api/filters?category=uyut-i-interer'),
        ]);
        
        if (!productsResponse.ok) {
          throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        
        const productsData: ApiResponse = await productsResponse.json();
        const filtersData = await filtersResponse.json();
        
        // Ensure products is an array
        const products = Array.isArray(productsData?.products) ? productsData.products : [];
        
        setAllProducts(products);
        setFilteredProducts(products);
        setPagination(productsData.pagination);
        setCurrentPage(1);

        // Calculate price range from products
        const prices = products.map((p) => p.price);
        const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 1000) * 1000 : 0;
        const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 50000;

        // Build filters array (используем все опции из API, не фильтруем по загруженным товарам)
        const newFilters: Filter[] = [];

        // Вид товара
        if (filtersData.productType && filtersData.productType.length > 0) {
          newFilters.push({
            id: 'productType',
            name: 'Вид товара',
            type: 'checkbox',
            options: filtersData.productType,
          });
        }

        // Назначение
        if (filtersData.purpose && filtersData.purpose.length > 0) {
          newFilters.push({
            id: 'purpose',
            name: 'Назначение',
            type: 'checkbox',
            options: filtersData.purpose,
          });
        }

        // Бренд
        if (filtersData.brand && filtersData.brand.length > 0) {
          newFilters.push({
            id: 'brand',
            name: 'Бренд',
            type: 'checkbox',
            options: filtersData.brand,
          });
        }

        // Страна
        if (filtersData.country && filtersData.country.length > 0) {
          newFilters.push({
            id: 'country',
            name: 'Страна',
            type: 'checkbox',
            options: filtersData.country,
          });
        }

        // Цена (всегда добавляем)
        newFilters.push({
          id: 'price',
          name: 'Цена',
          type: 'range',
          min: minPrice,
          max: maxPrice,
          step: 1000,
        });

        setFilters(newFilters);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error to prevent undefined issues
        setAllProducts([]);
        setFilteredProducts([]);
        setFilters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isMounted, searchParams]);

  // Filtering is now done server-side, so we just use allProducts as filteredProducts
  useEffect(() => {
    setFilteredProducts(allProducts);
  }, [allProducts]);

  // Lazy loading для загрузки следующих страниц
  const loadMore = useCallback(async () => {
    if (loadingMore || currentPage >= pagination.totalPages || loading) {
      return;
    }

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      
      // Build query string from search params
      const queryParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        queryParams.append(key, value);
      });
      queryParams.set('category', 'uyut-i-interer');
      queryParams.set('page', nextPage.toString());
      queryParams.set('limit', '24');

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const data: ApiResponse = await response.json();
      
      // Append new products to existing ones
      setAllProducts(prev => [...prev, ...data.products]);
      setFilteredProducts(prev => [...prev, ...data.products]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, currentPage, pagination.totalPages, loading, searchParams]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (pagination.totalPages === 0 || loading || currentPage >= pagination.totalPages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if user is scrolling in filters sidebar
        const filtersSidebar = document.querySelector('aside.lg\\:w-64');
        const isScrollingFilters = filtersSidebar && (
          document.activeElement?.closest('aside') === filtersSidebar ||
          (filtersSidebar as HTMLElement).matches(':hover')
        );

        // Don't trigger infinite scroll if user is interacting with filters
        if (entries[0].isIntersecting && !loadingMore && !isScrollingFilters) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    setTimeout(() => {
      const sentinel = document.getElementById('scroll-sentinel-home');
      if (sentinel) {
        observer.observe(sentinel);
      }
    }, 100);

      return () => {
        const sentinel = document.getElementById('scroll-sentinel-home');
        if (sentinel) {
          observer.unobserve(sentinel);
        }
      };
    }, [currentPage, pagination.totalPages, loading, loadingMore, loadMore]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Banner with Image */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058&auto=format&fit=crop&ixlib=rb-4.0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Уют и интерьер</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Уют и интерьер
            </h1>
            
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-xl">
              Создайте неповторимую атмосферу уюта с премиальными товарами для интерьера
            </p>
            
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            >
              Смотреть коллекцию
            </Button>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2058&auto=format&fit=crop)',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">

            <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl">
              <CardContent className="p-6">
                <div className={`space-y-4 text-muted-foreground ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                  <p className="leading-relaxed">
                    Создайте уютную и стильную атмосферу в вашем доме с помощью премиальных товаров для интерьера. 
                    Каждый элемент продуман до мелочей, чтобы добавить тепла и гармонии в ваше пространство.
                  </p>

                  <p className="font-medium text-foreground">
                    Мы предлагаем широкий выбор товаров для создания идеального интерьера, которые подчеркнут 
                    ваш уникальный стиль и создадут атмосферу комфорта.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                >
                  {isDescriptionExpanded ? (
                    <>
                      Свернуть <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Читать далее <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div 
                className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pb-4 lg:block"
                onWheel={(e) => {
                  // Prevent page scroll when scrolling filters on desktop
                  e.stopPropagation();
                }}
                onTouchMove={(e) => {
                  // Prevent page scroll on touch devices when scrolling filters
                  e.stopPropagation();
                }}
              >
                <ProductFilters filters={filters} basePath="/uyut-i-interer" />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort and Results Count */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  {loading ? 'Загрузка...' : `Найдено товаров: ${pagination.total}`}
                </p>
                <SortSelector />
              </div>

              {/* Products */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Загрузка товаров...</p>
                </div>
              ) : Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                <>
                  <ProductGrid 
                    products={filteredProducts} 
                    pagination={pagination}
                    searchParams={{}}
                    loadingMore={loadingMore}
                    hasMore={currentPage < pagination.totalPages}
                  />
                  {/* Scroll Sentinel для infinite scroll */}
                  {currentPage < pagination.totalPages && (
                    <div id="scroll-sentinel-home" className="h-10 flex items-center justify-center mt-6">
                      {loadingMore && (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      )}
                    </div>
                  )}
                  {currentPage >= pagination.totalPages && filteredProducts.length > 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Все товары загружены</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Товары не найдены. Попробуйте изменить фильтры.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomeCozyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <HomeCozyContent />
    </Suspense>
  );
}

