'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sku?: string;
  stock: number;
  brand: {
    name: string;
  };
  images: Array<{
    url: string;
  }>;
}

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
  selectedProductId?: string | null;
}

export function ProductPicker({ open, onClose, onSelect, selectedProductId }: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadProducts = async (currentSearch: string, currentPage: number, append: boolean = false) => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

      if (!token) {
        console.error('No admin token found');
        return;
      }

      const url = `/api/admin/products/search?q=${encodeURIComponent(currentSearch)}&page=${currentPage}&limit=20`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load products');

      const data = await response.json();
      
      if (append) {
        setProducts(prev => [...prev, ...(data.products || [])]);
      } else {
        setProducts(data.products || []);
      }

      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load products when dialog opens or search/page changes
  useEffect(() => {
    if (open) {
      loadProducts(search, page, page > 1);
    }
  }, [open, search, page]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const getImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url.startsWith('http') 
        ? product.images[0].url 
        : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${product.images[0].url}`;
    }
    return '/placeholder-product.jpg';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбрать товар</DialogTitle>
          <DialogDescription>
            Найдите и выберите товар для добавления в письмо
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, артикулу, бренду..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          {loading && products.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Товары не найдены
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover:border-primary transition-colors ${
                    selectedProductId === product.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    onSelect(product);
                    onClose();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                            <p className="text-sm font-semibold mt-1">
                              {product.price.toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                          {selectedProductId === product.id && (
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && (
            <div className="text-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Загрузить еще
              </Button>
            </div>
          )}

          {loading && products.length > 0 && (
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
