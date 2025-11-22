'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  X,
  Check,
  Percent,
  Search,
  Package,
  Layers
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Category {
  id: string;
  name: string;
  slug: string;
}

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
  images?: Array<{ url: string }>;
}

interface SeasonalDiscountCategory {
  category: Category;
  categoryId: string;
}

interface SeasonalDiscountProduct {
  product: Product;
  productId: string;
}

interface SeasonalDiscount {
  id: string;
  name: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applyTo: 'categories' | 'products';
  categories: SeasonalDiscountCategory[];
  products: SeasonalDiscountProduct[];
  _count?: {
    categories: number;
    products: number;
  };
}

export default function AdminSeasonalDiscountsPage() {
  const [discounts, setDiscounts] = useState<SeasonalDiscount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<SeasonalDiscount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    applyTo: 'categories' as 'categories' | 'products',
    categoryIds: [] as string[],
    productIds: [] as string[],
    discount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    loadDiscounts();
    loadCategories();
  }, [router]);

  const loadDiscounts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/seasonal-discounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);
      }
    } catch (error) {
      console.error('Error loading seasonal discounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.filter((c: any) => c.isActive));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.products || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearch, searchProducts]);

  const handleOpenModal = (discount?: SeasonalDiscount) => {
    if (discount) {
      setEditingDiscount(discount);
      
      if (discount.applyTo === 'products') {
        setSelectedProducts(discount.products.map(p => p.product));
      }
      
      setFormData({
        name: discount.name,
        applyTo: discount.applyTo,
        categoryIds: discount.applyTo === 'categories' ? discount.categories.map(c => c.categoryId) : [],
        productIds: discount.applyTo === 'products' ? discount.products.map(p => p.productId) : [],
        discount: discount.discount.toString(),
        startDate: new Date(discount.startDate).toISOString().split('T')[0],
        endDate: new Date(discount.endDate).toISOString().split('T')[0],
        isActive: discount.isActive,
      });
    } else {
      setEditingDiscount(null);
      setSelectedProducts([]);
      setFormData({
        name: '',
        applyTo: 'categories',
        categoryIds: [],
        productIds: [],
        discount: '',
        startDate: '',
        endDate: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
    setSelectedProducts([]);
    setProductSearch('');
    setSearchResults([]);
    setFormData({
      name: '',
      applyTo: 'categories',
      categoryIds: [],
      productIds: [],
      discount: '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const toggleProduct = (product: Product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
      setFormData(prev => ({
        ...prev,
        productIds: prev.productIds.filter(id => id !== product.id),
      }));
    } else {
      setSelectedProducts(prev => [...prev, product]);
      setFormData(prev => ({
        ...prev,
        productIds: [...prev.productIds, product.id],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.applyTo === 'categories' && formData.categoryIds.length === 0) {
      alert('Выберите хотя бы одну категорию');
      return;
    }

    if (formData.applyTo === 'products' && formData.productIds.length === 0) {
      alert('Выберите хотя бы один товар');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const url = editingDiscount
        ? `/api/admin/seasonal-discounts/${editingDiscount.id}`
        : '/api/admin/seasonal-discounts';
      
      const method = editingDiscount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadDiscounts();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при сохранении скидки');
      }
    } catch (error) {
      console.error('Error saving seasonal discount:', error);
      alert('Ошибка при сохранении скидки');
    }
  };

  const handleDelete = async (discountId: string, discountName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить скидку "${discountName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/seasonal-discounts/${discountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDiscounts(discounts.filter(d => d.id !== discountId));
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при удалении скидки');
      }
    } catch (error) {
      console.error('Error deleting seasonal discount:', error);
      alert('Ошибка при удалении скидки');
    }
  };

  const toggleStatus = async (discount: SeasonalDiscount) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/seasonal-discounts/${discount.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: discount.name,
          applyTo: discount.applyTo,
          categoryIds: discount.applyTo === 'categories' ? discount.categories.map(c => c.categoryId) : [],
          productIds: discount.applyTo === 'products' ? discount.products.map(p => p.productId) : [],
          discount: discount.discount,
          startDate: discount.startDate,
          endDate: discount.endDate,
          isActive: !discount.isActive,
        }),
      });

      if (response.ok) {
        await loadDiscounts();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка скидок...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Сезонные скидки</h1>
                <p className="text-gray-600">Всего акций: {discounts.length}</p>
              </div>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Создать акцию
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Discounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => {
            const startDate = new Date(discount.startDate);
            const endDate = new Date(discount.endDate);
            const now = new Date();
            const isActive = discount.isActive && startDate <= now && endDate >= now;
            const isPending = discount.isActive && startDate > now;
            const isExpired = endDate < now;

            return (
              <Card key={discount.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {discount.applyTo === 'categories' ? <Layers className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        {discount.name}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {discount.discount}% скидка
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(discount)}
                      >
                        {discount.isActive ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Apply Type */}
                  <div className="mb-4">
                    <Label className="text-xs text-gray-600 mb-2">
                      {discount.applyTo === 'categories' ? 'Категории' : 'Товары'}:
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {discount.applyTo === 'categories' ? (
                        discount.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat.categoryId} variant="outline" className="text-xs">
                            {cat.category.name}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {discount._count?.products || discount.products.length} товаров
                        </Badge>
                      )}
                      {discount.applyTo === 'categories' && discount.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{discount.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {startDate.toLocaleDateString('ru-RU')} – {endDate.toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between mb-4">
                    {isExpired ? (
                      <Badge variant="secondary">Завершена</Badge>
                    ) : isPending ? (
                      <Badge variant="outline">Ожидает начала</Badge>
                    ) : isActive ? (
                      <Badge variant="default">Активна</Badge>
                    ) : (
                      <Badge variant="secondary">Неактивна</Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenModal(discount)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(discount.id, discount.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {editingDiscount ? 'Редактировать акцию' : 'Новая акция'}
                  </CardTitle>
                  <CardDescription>
                    {editingDiscount ? 'Изменить параметры сезонной скидки' : 'Создать новую сезонную скидку'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Название акции *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Например: Осенняя распродажа"
                    required
                  />
                </div>

                {/* Apply To Selection */}
                <div>
                  <Label className="mb-3 block">Применить к *</Label>
                  <Tabs 
                    value={formData.applyTo} 
                    onValueChange={(value) => {
                      const applyTo = value as 'categories' | 'products';
                      setFormData({ 
                        ...formData, 
                        applyTo,
                        categoryIds: applyTo === 'categories' ? formData.categoryIds : [],
                        productIds: applyTo === 'products' ? formData.productIds : [],
                      });
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="categories">
                        <Layers className="h-4 w-4 mr-2" />
                        Категориям
                      </TabsTrigger>
                      <TabsTrigger value="products">
                        <Package className="h-4 w-4 mr-2" />
                        Конкретным товарам
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="categories" className="mt-4">
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={formData.categoryIds.includes(category.id)}
                              onCheckedChange={() => toggleCategory(category.id)}
                            />
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="cursor-pointer flex-1"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.categoryIds.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Выбрано категорий: {formData.categoryIds.length}
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="products" className="mt-4">
                      <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Поиск товаров..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        {/* Search Results */}
                        {productSearch && searchResults.length > 0 && (
                          <div className="border rounded-md max-h-60 overflow-y-auto">
                            {searchResults.map((product) => {
                              const isSelected = selectedProducts.some(p => p.id === product.id);
                              return (
                                <div
                                  key={product.id}
                                  className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                                    isSelected ? 'bg-blue-50' : ''
                                  }`}
                                  onClick={() => toggleProduct(product)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{product.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {(product.brand && product.brand.name) ? product.brand.name : 'Без бренда'} • {product.price?.toLocaleString('ru-RU') || 0} ₽
                                        {product.sku && ` • SKU: ${product.sku}`}
                                      </p>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-5 w-5 text-blue-600" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Selected Products */}
                        {selectedProducts.length > 0 && (
                          <div>
                            <Label className="mb-2 block">
                              Выбрано товаров: {selectedProducts.length}
                            </Label>
                            <div className="border rounded-md max-h-40 overflow-y-auto">
                              {selectedProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="p-2 border-b last:border-b-0 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-medium">{product.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(product.brand && product.brand.name) ? product.brand.name : 'Без бренда'} • {product.price?.toLocaleString('ru-RU') || 0} ₽
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleProduct(product)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="discount">Процент скидки * (1-100)</Label>
                  <div className="relative">
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="15"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Дата начала *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Дата окончания *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Активная акция (будет применяться к товарам)
                  </Label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    {editingDiscount ? 'Сохранить' : 'Создать'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
