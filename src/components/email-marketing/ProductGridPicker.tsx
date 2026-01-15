'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Check, X } from 'lucide-react';

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

interface ProductGridPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (products: Product[]) => void;
  selectedProducts: Product[];
  maxProducts?: number;
}

export function ProductGridPicker({ 
  open, 
  onClose, 
  onSelect, 
  selectedProducts = [],
  maxProducts = 9 
}: ProductGridPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<Product[]>(selectedProducts);

  // Синхронизируем выбранные товары при открытии диалога
  useEffect(() => {
    if (open) {
      setSelected(selectedProducts);
      setSearch('');
      setPage(1);
    }
  }, [open, selectedProducts]);

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

  useEffect(() => {
    if (open) {
      loadProducts(search, page, page > 1);
    }
  }, [open, search, page]);

  const toggleProduct = (product: Product) => {
    const isSelected = selected.some(p => p.id === product.id);
    if (isSelected) {
      setSelected(selected.filter(p => p.id !== product.id));
    } else {
      if (selected.length >= maxProducts) {
        alert(`Максимум ${maxProducts} товаров`);
        return;
      }
      setSelected([...selected, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelected(selected.filter(p => p.id !== productId));
  };

  const handleApply = () => {
    onSelect(selected);
    onClose();
  };

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

  const isSelected = (productId: string) => {
    return selected.some(p => p.id === productId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбрать товары для сетки</DialogTitle>
          <DialogDescription>
            Выберите до {maxProducts} товаров для добавления в сетку
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Products */}
          {selected.length > 0 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Выбрано: {selected.length}/{maxProducts}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                  Очистить
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 bg-background border rounded px-2 py-1 text-sm"
                  >
                    <span className="max-w-[200px] truncate">{product.name}</span>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => {
                const selectedItem = isSelected(product.id);
                return (
                  <Card
                    key={product.id}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      selectedItem ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => toggleProduct(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden relative">
                          <img
                            src={getImageUrl(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                          {selectedItem && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                          <p className="text-sm font-semibold mt-1">
                            {product.price.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleApply}>
              Применить ({selected.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
