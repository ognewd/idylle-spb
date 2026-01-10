'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProductQRCode from '@/components/admin/ProductQRCode';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ArrowLeft,
  Package,
  Eye,
  EyeOff,
  X,
  QrCode,
  Upload
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  myWarehouseCode?: string;
  manufacturerSku?: string;
  productType?: string;
  purpose?: string;
  country?: string;
  barcode?: string;
  brand: {
    name: string;
  };
  productCategories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ slug: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  const loadCategoryName = async (categoryId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategoryName(data.name);
      }
    } catch (error) {
      console.error('Error loading category:', error);
    }
  };

  const loadProducts = useCallback(async (page: number = 1, append: boolean = false, searchQuery?: string) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const token = localStorage.getItem('admin_token');
      const searchParam = searchQuery !== undefined ? searchQuery : searchTerm;
      const url = `/api/admin/products?page=${page}&limit=20${searchParam ? `&search=${encodeURIComponent(searchParam)}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (append) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
          setTotalProducts(data.pagination.total);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchTerm]);

  // Debounce search and reload products
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setHasMore(true);
      loadProducts(1, false, searchTerm);
    }, searchTerm ? 500 : 0); // 500ms debounce only if search term exists

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Separate effect for search to avoid conflicts

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Get category from URL if exists
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategoryId(categoryParam);
      // Load category name
      loadCategoryName(categoryParam);
    }

    // Only load products if search is empty (search is handled by separate effect)
    if (!searchTerm) {
      setCurrentPage(1);
      setHasMore(true);
      loadProducts(1, false);
    }
  }, [router, searchParams]); // Removed loadProducts and searchTerm to avoid conflicts

  // Load more products on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        if (!isLoadingMore && hasMore && !isLoading && !searchTerm) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadProducts(nextPage, true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, hasMore, isLoadingMore, isLoading, searchTerm, loadProducts]);

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setProducts(products.map(p => 
          p.id === productId ? { ...p, isActive: !isActive } : p
        ));
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const clearCategoryFilter = () => {
    setSelectedCategoryId(null);
    setCategoryName('');
    router.push('/admin/products');
  };

  const handleOpenQRCode = (slug: string, name: string) => {
    setSelectedProduct({ slug, name });
    setQrModalOpen(true);
  };

  const handleCloseQRCode = () => {
    setQrModalOpen(false);
    setSelectedProduct(null);
  };

  // Search is now handled on server, so we just filter by category if needed
  const filteredProducts = selectedCategoryId 
    ? products.filter(product => 
        product.productCategories.some(pc => pc.category.id === selectedCategoryId)
      )
    : products;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Управление товарами</h1>
                <p className="text-gray-600">Всего товаров: {totalProducts || products.length}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/admin/products/import')}>
                <Upload className="h-4 w-4 mr-2" />
                Импорт
              </Button>
              <Button onClick={() => router.push('/admin/products/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить товар
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter Badge */}
        {selectedCategoryId && categoryName && (
          <div className="mb-4">
            <Badge 
              variant="secondary" 
              className="text-sm py-2 px-4 cursor-pointer hover:bg-secondary/80"
              onClick={clearCategoryFilter}
            >
              Категория: {categoryName}
              <X className="h-3 w-3 ml-2" />
            </Badge>
          </div>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск по названию, бренду или категории..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {product.brand.name} • {product.productCategories.map(pc => pc.category.name).join(', ') || 'Без категории'}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleProductStatus(product.id, product.isActive)}
                    >
                      {product.isActive ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenQRCode(product.slug, product.name)}
                      title="Показать QR-код"
                    >
                      <QrCode className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Цена:</span>
                    <span className="font-semibold">{product.price.toLocaleString()} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Остаток:</span>
                    <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock} шт.
                    </span>
                  </div>
                  {product.myWarehouseCode && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Код Мой склад:</span>
                      <span className="text-sm font-mono">{product.myWarehouseCode}</span>
                    </div>
                  )}
                  {product.manufacturerSku && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Артикул производителя:</span>
                      <span className="text-sm">{product.manufacturerSku}</span>
                    </div>
                  )}
                  {product.productType && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Вид товара:</span>
                      <span className="text-sm">{product.productType}</span>
                    </div>
                  )}
                  {product.purpose && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Назначение:</span>
                      <span className="text-sm">{product.purpose}</span>
                    </div>
                  )}
                  {product.country && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Страна:</span>
                      <span className="text-sm">{product.country}</span>
                    </div>
                  )}
                  {product.barcode && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Штрихкод:</span>
                      <span className="text-sm font-mono">{product.barcode}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">Статус:</span>
                    <div className="flex space-x-1">
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Активен' : 'Скрыт'}
                      </Badge>
                      {product.isFeatured && (
                        <Badge variant="outline">Рекомендуемый</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Товары не найдены' : 'Нет товаров'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Добавьте первый товар в каталог'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/admin/products/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить товар
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedProduct && (
        <ProductQRCode
          productSlug={selectedProduct.slug}
          productName={selectedProduct.name}
          isOpen={qrModalOpen}
          onClose={handleCloseQRCode}
        />
      )}
    </div>
  );
}
