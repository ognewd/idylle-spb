'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Upload, X, RefreshCw } from 'lucide-react';
import { generateSlug } from '@/lib/transliterate';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id?: string;
  name: string;
  value: string;
  price: string;
  comparePrice: string;
  stock: string;
  sku: string;
  isDefault: boolean;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  comparePrice: string;
  sku: string;
  volume: string;
  gender: string;
  aromaFamily: string;
  ingredients: string;
  stock: string;
  weight: string;
  dimensions: string;
  myWarehouseCode: string;
  manufacturerSku: string;
  productType: string;
  purpose: string;
  country: string;
  barcode: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryIds: string[];
  brandId: string;
  images: Array<{
    id?: string;
    url: string;
    alt: string;
    isPrimary: boolean;
    file?: File;
  }>;
  variants: ProductVariant[];
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    sku: '',
    volume: '',
    gender: '',
    aromaFamily: '',
    ingredients: '',
    stock: '',
    weight: '',
    dimensions: '',
    myWarehouseCode: '',
    manufacturerSku: '',
    productType: '',
    purpose: '',
    country: '',
    barcode: '',
    isActive: true,
    isFeatured: false,
    categoryIds: [],
    brandId: '',
    images: [],
    variants: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    loadProductData();
    loadCategoriesAndBrands();
  }, [params.id]);

  const loadProductData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/products/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const product = await response.json();
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: product.price?.toString() || '',
          comparePrice: product.comparePrice?.toString() || '',
          sku: product.sku || '',
          volume: product.volume || '',
          gender: product.gender || '',
          aromaFamily: product.aromaFamily || '',
          ingredients: product.ingredients || '',
          stock: product.stock?.toString() || '',
          weight: product.weight?.toString() || '',
          dimensions: product.dimensions || '',
          myWarehouseCode: product.myWarehouseCode || '',
          manufacturerSku: product.manufacturerSku || '',
          productType: product.productType || '',
          purpose: product.purpose || '',
          country: product.country || '',
          barcode: product.barcode || '',
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          categoryIds: product.productCategories?.map((pc: any) => pc.categoryId) || [],
          brandId: product.brandId || '',
          images: product.images?.map((img: any) => ({
            id: img.id,
            url: img.url,
            alt: img.alt || '',
            isPrimary: img.isPrimary || false,
          })) || [],
          variants: product.variants?.map((v: any) => ({
            id: v.id,
            name: v.name || 'Объём',
            value: v.value || '',
            price: v.price?.toString() || '',
            comparePrice: v.comparePrice?.toString() || '',
            stock: v.stock?.toString() || '',
            sku: v.sku || '',
            isDefault: v.isDefault || false,
          })) || [],
        });
      } else {
        setError('Не удалось загрузить данные товара');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCategoriesAndBrands = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/admin/categories', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/admin/brands', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const regenerateSlug = () => {
    const slug = generateSlug(formData.name);
    setFormData(prev => ({
      ...prev,
      slug,
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '', isPrimary: false }],
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImage = (index: number, field: 'url' | 'alt', value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      ),
    }));
  };

  const handleImageFileUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => 
          i === index ? { ...img, url, file, alt: file.name } : img
        ),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    fileArray.forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => {
          const existingImagesCount = prev.images.length;
          const newImage = {
            url: imageUrl,
            alt: file.name,
            isPrimary: existingImagesCount === 0 && index === 0,
            file: file,
          };
          return {
            ...prev,
            images: [...prev.images, newImage],
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  // Variant management functions
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        name: 'Объём',
        value: '',
        price: '',
        comparePrice: '',
        stock: '',
        sku: '',
        isDefault: prev.variants.length === 0,
      }],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const setDefaultVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => ({
        ...variant,
        isDefault: i === index,
      })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('admin_token');
      
      // Upload image files first
      const imagesWithUrls = await Promise.all(
        formData.images.map(async (image) => {
          if (image.file) {
            // Upload file to server
            const uploadFormData = new FormData();
            uploadFormData.append('file', image.file);
            
            const uploadResponse = await fetch('/api/admin/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: uploadFormData,
            });
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              return {
                ...image,
                url: uploadData.url,
                file: undefined, // Remove file from data
              };
            } else {
              throw new Error('Failed to upload image');
            }
          }
          return { ...image, file: undefined };
        })
      );

      // Prepare form data without file objects
      const submitData = {
        ...formData,
        images: imagesWithUrls,
      };

      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Товар успешно обновлён!');
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      } else {
        setError(data.error || 'Ошибка при обновлении товара');
      }
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
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
                onClick={() => router.push('/admin/products')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Редактировать товар</h1>
                <p className="text-gray-600">Изменение информации о товаре</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Название, описание и основные характеристики товара</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название товара *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug">URL slug *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={regenerateSlug}
                      className="h-auto py-1 px-2 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Обновить
                    </Button>
                  </div>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Краткое описание</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Полное описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Категории * (выберите одну или несколько)</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={formData.categoryIds.includes(category.id)}
                        onCheckedChange={(checked) => {
                          const newCategoryIds = checked
                            ? [...formData.categoryIds, category.id]
                            : formData.categoryIds.filter(id => id !== category.id);
                          setFormData(prev => ({ ...prev, categoryIds: newCategoryIds }));
                        }}
                      />
                      <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandId">Бренд *</Label>
                  <Select value={formData.brandId} onValueChange={(value) => handleInputChange('brandId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите бренд" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Цена и склад</CardTitle>
              <CardDescription>Стоимость товара и информация о наличии (используйте если нет вариантов)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Цена (₽) {formData.variants.length === 0 && '*'}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required={formData.variants.length === 0}
                    disabled={formData.variants.length > 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Старая цена (₽)</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                    disabled={formData.variants.length > 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Остаток на складе {formData.variants.length === 0 && '*'}</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    required={formData.variants.length === 0}
                    disabled={formData.variants.length > 0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">Артикул</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    disabled={formData.variants.length > 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">Объем</Label>
                  <Input
                    id="volume"
                    value={formData.volume}
                    onChange={(e) => handleInputChange('volume', e.target.value)}
                    disabled={formData.variants.length > 0}
                  />
                </div>
              </div>
              {formData.variants.length > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-800">
                    Цена и складские запасы управляются через варианты товара ниже
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Product Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Варианты товара (объёмы)</CardTitle>
              <CardDescription>
                Добавьте разные объёмы товара с их ценами и остатками. Например: 1.5мл, 60мл, 100мл
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">
                      Вариант #{index + 1} {variant.isDefault && <span className="text-xs text-blue-600">(по умолчанию)</span>}
                    </h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariant(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Название варианта</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="Объём"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Значение (объём) *</Label>
                      <Input
                        value={variant.value}
                        onChange={(e) => updateVariant(index, 'value', e.target.value)}
                        placeholder="60мл"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Цена (₽) *</Label>
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Старая цена (₽)</Label>
                      <Input
                        type="number"
                        value={variant.comparePrice}
                        onChange={(e) => updateVariant(index, 'comparePrice', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Остаток *</Label>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Артикул</Label>
                      <Input
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 flex items-end">
                      <Button
                        type="button"
                        variant={variant.isDefault ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDefaultVariant(index)}
                        className="w-full"
                      >
                        {variant.isDefault ? "✓ По умолчанию" : "Сделать вариантом по умолчанию"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Добавить вариант
              </Button>

              {formData.variants.length === 0 && (
                <Alert>
                  <AlertDescription>
                    Если у товара есть несколько объёмов, добавьте их как варианты. 
                    Это позволит покупателям выбирать нужный объём прямо на странице товара.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Характеристики товара</CardTitle>
              <CardDescription>Детальная информация о парфюме</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Пол</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите пол" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Мужской</SelectItem>
                      <SelectItem value="women">Женский</SelectItem>
                      <SelectItem value="unisex">Унисекс</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aromaFamily">Ароматическая семья</Label>
                  <Input
                    id="aromaFamily"
                    value={formData.aromaFamily}
                    onChange={(e) => handleInputChange('aromaFamily', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Состав</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => handleInputChange('ingredients', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Вес (г)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Размеры</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excel Import Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Дополнительные поля (из Excel)</CardTitle>
              <CardDescription>Поля для импорта и синхронизации с Мой склад</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="myWarehouseCode">Код Мой склад</Label>
                  <Input
                    id="myWarehouseCode"
                    value={formData.myWarehouseCode}
                    onChange={(e) => handleInputChange('myWarehouseCode', e.target.value)}
                    placeholder="Уникальный код из Мой склад"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturerSku">Артикул производителя</Label>
                  <Input
                    id="manufacturerSku"
                    value={formData.manufacturerSku}
                    onChange={(e) => handleInputChange('manufacturerSku', e.target.value)}
                    placeholder="Артикул от производителя"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">Вид товара (для фильтра)</Label>
                  <Input
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    placeholder="Например: Спрей для дома"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Назначение (для какого помещения)</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder="Например: Жилая комната"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Страна</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Например: Франция"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Штрихкод</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder="Штрихкод товара"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Изображения товара</CardTitle>
              <CardDescription>Загрузите фотографии товара с устройства или укажите URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <Label>Выбрать несколько изображений</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMultipleImageUpload(e.target.files)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Можно выбрать несколько файлов одновременно (Ctrl/Cmd + клик)</p>
              </div>
              
              {formData.images.map((image, index) => (
                <div key={index} className="flex space-x-4 p-4 border rounded-lg">
                  {image.url && (
                    <div className="w-24 h-24 flex-shrink-0 border rounded overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={image.alt || `Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label>Загрузить с устройства</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageFileUpload(index, file);
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Или URL изображения</Label>
                      <Input
                        value={image.url}
                        onChange={(e) => updateImage(index, 'url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Alt текст</Label>
                      <Input
                        value={image.alt}
                        onChange={(e) => updateImage(index, 'alt', e.target.value)}
                        placeholder="Описание изображения"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      type="button"
                      variant={image.isPrimary ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPrimaryImage(index)}
                    >
                      {image.isPrimary ? "Основное" : "Сделать основным"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addImage}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Добавить изображение
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Статус товара</CardTitle>
              <CardDescription>Настройки видимости и рекомендаций</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                />
                <Label htmlFor="isActive">Товар активен (отображается в каталоге)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked as boolean)}
                />
                <Label htmlFor="isFeatured">Рекомендуемый товар</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
