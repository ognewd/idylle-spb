'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SortSelector } from '@/components/product/SortSelector';

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

function CatalogContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  });
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Fetch products and filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!isInitialLoadRef.current) {
          setIsTransitioning(true);
        }
        
        // Build query string from search params
        const queryParams = new URLSearchParams();
        searchParams.forEach((value, key) => {
          queryParams.append(key, value);
        });

        // Fetch products
        const productsResponse = await fetch(`/api/products?${queryParams.toString()}`);
        const productsData: ApiResponse = await productsResponse.json();
        
        setProducts(productsData.products);
        setPagination(productsData.pagination);

        // Fetch filters (categories, brands, and other filters)
        const [categoriesResponse, filtersResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/filters'),
        ]);
        
        const categories = await categoriesResponse.json();
        const filtersData = await filtersResponse.json();

        // Build filters array
        const filtersDataArray: Filter[] = [
          {
            id: 'category',
            name: 'Категория',
            type: 'checkbox',
            options: categories.map((cat: any) => ({
              id: cat.slug,
              name: cat.name,
              count: cat.productCount,
            })),
          },
          {
            id: 'productType',
            name: 'Вид товара',
            type: 'checkbox',
            options: filtersData.productType || [],
          },
          {
            id: 'purpose',
            name: 'Назначение',
            type: 'checkbox',
            options: filtersData.purpose || [],
          },
          {
            id: 'brand',
            name: 'Бренд',
            type: 'checkbox',
            options: filtersData.brand || [],
          },
          {
            id: 'country',
            name: 'Страна',
            type: 'checkbox',
            options: filtersData.country || [],
          },
          {
            id: 'gender',
            name: 'Пол',
            type: 'checkbox',
            options: [
              { id: 'men', name: 'Мужской', count: 0 },
              { id: 'women', name: 'Женский', count: 0 },
              { id: 'unisex', name: 'Унисекс', count: 0 },
            ],
          },
          {
            id: 'aromaFamily',
            name: 'Ароматическая семья',
            type: 'checkbox',
            options: [
              { id: 'woody', name: 'Woody', count: 0 },
              { id: 'oriental', name: 'Oriental', count: 0 },
              { id: 'fruity', name: 'Fruity', count: 0 },
              { id: 'floral', name: 'Floral', count: 0 },
              { id: 'fresh', name: 'Fresh', count: 0 },
            ],
          },
          {
            id: 'price',
            name: 'Цена',
            type: 'range',
            min: 0,
            max: 50000,
            step: 1000,
          },
        ];

        setFilters(filtersDataArray);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          setIsInitialLoad(false);
        }
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 200);
      }
    };

    fetchData();
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [searchParams]);

  // Load more products when scrolling
  const loadMore = useCallback(async () => {
    if (loadingMore || pagination.page >= pagination.totalPages) {
      return;
    }

    try {
      setLoadingMore(true);
      const nextPage = pagination.page + 1;
      
      // Build query string from search params
      const queryParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        queryParams.append(key, value);
      });
      queryParams.set('page', nextPage.toString());

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const data: ApiResponse = await response.json();
      
      // Append new products to existing ones
      setProducts(prev => [...prev, ...data.products]);
      setPagination(prev => ({
        ...prev,
        page: nextPage,
      }));
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, pagination.page, pagination.totalPages, searchParams]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Don't set up observer if there are no more pages or still loading initial data
    if (pagination.totalPages === 0 || loading) {
      return;
    }

    const handleLoadMore = () => {
      if (!loadingMore && pagination.page < pagination.totalPages) {
        loadMore();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    // Wait for the sentinel element to be rendered
    setTimeout(() => {
      const sentinel = document.getElementById('scroll-sentinel');
      if (sentinel) {
        observer.observe(sentinel);
      }
    }, 100);

    return () => {
      const sentinel = document.getElementById('scroll-sentinel');
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [pagination.page, pagination.totalPages, pagination.total, loadingMore, loading, loadMore]);

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
  ];

  if (loading && isInitialLoad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 w-48 bg-muted rounded mb-4" />
          <div className="flex flex-col lg:flex-row gap-8 mt-6">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border rounded p-4">
                    <div className="h-4 w-24 bg-muted rounded mb-3" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center space-x-2">
                          <div className="h-4 w-4 border rounded bg-muted" />
                          <div className="h-4 w-20 bg-muted rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
            <main className="flex-1">
              <div className="h-8 w-48 bg-muted rounded mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border rounded p-4">
                    <div className="h-48 w-full bg-muted rounded mb-4" />
                    <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-4 w-1/2 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:bg-white lg:rounded-lg lg:shadow-sm lg:p-2 lg:-mr-2">
          <ProductFilters filters={filters} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Каталог товаров</h1>
              <p className="text-muted-foreground mt-1">
                Найдено товаров: {pagination.total}
              </p>
            </div>
            
            <SortSelector currentSort="newest" />
          </div>

          <div
            className={`relative transition-opacity duration-300 ${isTransitioning ? 'opacity-60' : 'opacity-100'}`}
          >
            {isTransitioning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 shadow">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                  <span className="text-sm text-muted-foreground">Обновляем товары...</span>
                </div>
              </div>
            )}

            <ProductGrid
              products={products}
              pagination={pagination}
              searchParams={Object.fromEntries(searchParams.entries())}
              loadingMore={loadingMore}
              hasMore={pagination.page < pagination.totalPages}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}