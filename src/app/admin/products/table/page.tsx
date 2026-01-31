'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowUpDown, 
  Search, 
  Filter,
  MoveHorizontal,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  brand?: {
    name: string;
  };
  productCategories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsTableViewPage() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bulkAction, setBulkAction] = useState<'category' | 'active' | 'price' | null>(null);
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');
  const [bulkActive, setBulkActive] = useState<boolean>(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAdminToken(token);
  }, [router]);

  useEffect(() => {
    if (adminToken) {
      fetchCategories();
    }
  }, [adminToken]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (filterCategory !== 'all') params.set('category', filterCategory);
      params.set('sortField', sortField);
      params.set('sortOrder', sortOrder);

      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 0);
      } else {
        setMessage({ type: 'error', text: 'Ошибка загрузки товаров' });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки данных' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchProducts();
    }
  }, [adminToken, page, pageSize, searchQuery, filterCategory, sortField, sortOrder]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };
  const handleFilterCategoryChange = (value: string) => {
    setFilterCategory(value);
    setPage(1);
  };
  const handleSort = (field: 'name' | 'price' | 'stock') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const applyBulkAction = async () => {
    if (selectedProducts.size === 0) {
      setMessage({ type: 'error', text: 'Выберите товары для изменения' });
      return;
    }

    if (!bulkAction) {
      setMessage({ type: 'error', text: 'Выберите действие' });
      return;
    }

    if (bulkAction === 'category' && !bulkCategoryId) {
      setMessage({ type: 'error', text: 'Выберите категорию' });
      return;
    }

    try {
      setProcessing(true);
      setMessage(null);

      const selectedProductIds = Array.from(selectedProducts);

      if (bulkAction === 'category') {
        const response = await fetch('/api/admin/products/bulk-update-category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            productIds: selectedProductIds,
            categoryId: bulkCategoryId,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка при обновлении категории');
        }

        setMessage({ 
          type: 'success', 
          text: `Категория обновлена для ${selectedProductIds.length} товаров` 
        });
      } else if (bulkAction === 'active') {
        const response = await fetch('/api/admin/products/bulk-update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            productIds: selectedProductIds,
            isActive: bulkActive,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка при обновлении статуса');
        }

        setMessage({ 
          type: 'success', 
          text: `Статус обновлен для ${selectedProductIds.length} товаров` 
        });
      }

      await fetchProducts();
      setSelectedProducts(new Set());
      setBulkAction(null);
      setBulkCategoryId('');
    } catch (error) {
      console.error('Error applying bulk action:', error);
      setMessage({ type: 'error', text: 'Ошибка при применении изменений' });
    } finally {
      setProcessing(false);
    }
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  if (loading || !adminToken) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Табличный вид</h2>
        <p className="text-gray-600 text-sm">
          Массовое редактирование и перенос товаров между категориями
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск по названию или slug..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCategory} onValueChange={handleFilterCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Фильтр по категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              <SelectItem value="none">Без категории</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>На странице:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>
                {total === 0 ? 'Нет товаров' : `Показано ${startItem}–${endItem} из ${total}`}
              </span>
            </div>
          </div>
        </div>

        {selectedProducts.size > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-medium">
                Выбрано: {selectedProducts.size}
              </span>

              <Select value={bulkAction || ''} onValueChange={(val) => setBulkAction(val as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Выберите действие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">
                    <div className="flex items-center gap-2">
                      <MoveHorizontal className="h-4 w-4" />
                      Изменить категорию
                    </div>
                  </SelectItem>
                  <SelectItem value="active">Изменить статус</SelectItem>
                </SelectContent>
              </Select>

              {bulkAction === 'category' && (
                <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {bulkAction === 'active' && (
                <Select value={bulkActive.toString()} onValueChange={(val) => setBulkActive(val === 'true')}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Активен</SelectItem>
                    <SelectItem value="false">Неактивен</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button 
                onClick={applyBulkAction}
                disabled={processing || !bulkAction}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {processing ? 'Обработка...' : 'Применить'}
              </Button>

              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedProducts(new Set());
                  setBulkAction(null);
                }}
              >
                Отменить
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.size === products.length && products.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Название
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Категории</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-2">
                    Цена
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('stock')}>
                  <div className="flex items-center gap-2">
                    Остаток
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.brand?.name || '—'}</TableCell>
                  <TableCell>
                    {product.productCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.productCategories.map(pc => (
                          <span 
                            key={pc.category.id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700"
                          >
                            {pc.category.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Без категории</span>
                    )}
                  </TableCell>
                  <TableCell>{product.price.toLocaleString('ru-RU')} ₽</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs ${
                      product.isActive 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {product.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Товары не найдены
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Страница {page} из {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="min-w-[36px]"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Вперёд
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
