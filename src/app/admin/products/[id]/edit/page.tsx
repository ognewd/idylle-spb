'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Upload, X, RefreshCw, ChevronUp, ChevronDown, GripVertical, CopyMinus, FileText } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  name: string; // Полное название
  shortName: string; // Краткое название (для H1)
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
  topNotes: string; // Основные ноты
  purpose: string;
  usageInstructions: string; // Способ применения
  brandCountry: string; // Страна происхождения бренда
  manufactureCountry: string; // Страна производства
  warehouseLocation: string; // Место товара (только для админки)
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

// Компонент для сортируемого элемента изображения
function SortableImageItem({
  image,
  index,
  total,
  onUpdate,
  onRemove,
  onSetPrimary,
  onMove,
  onFileUpload,
  onFilesUpload,
}: {
  image: { url: string; alt: string; isPrimary: boolean; file?: File };
  index: number;
  total: number;
  onUpdate: (field: 'url' | 'alt', value: string) => void;
  onRemove: () => void;
  onSetPrimary: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onFileUpload: (file: File) => void;
  onFilesUpload?: (files: File[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex space-x-4 p-4 border-2 rounded-lg bg-white transition-all ${
        isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      } ${image.isPrimary ? 'ring-2 ring-blue-400' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-8 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        title="Перетащите для изменения порядка"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Image Preview */}
      {image.url && (
        <div className="w-32 h-32 flex-shrink-0 overflow-hidden flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <img
            src={image.url}
            alt={image.alt || `Preview ${index + 1}`}
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
        </div>
      )}

      {/* Form Fields */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
            #{index + 1} {image.isPrimary && '⭐ Основное'}
          </span>
        </div>
        <div>
          <Label>Загрузить с устройства</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;
              if (files.length === 1) {
                onFileUpload(files[0]);
              } else if (onFilesUpload) {
                onFilesUpload(Array.from(files));
              } else {
                onFileUpload(files[0]);
              }
              e.target.value = '';
            }}
            className="mt-1 cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-1">Можно выбрать несколько файлов (Ctrl/Cmd + клик)</p>
        </div>
        <div>
          <Label>Или URL изображения</Label>
          <Input
            value={image.url}
            onChange={(e) => onUpdate('url', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Alt текст</Label>
          <Input
            value={image.alt}
            onChange={(e) => onUpdate('alt', e.target.value)}
            placeholder="Описание изображения"
            className="mt-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-2">
        {/* Move Buttons */}
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="h-8"
            title="Переместить вверх"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="h-8"
            title="Переместить вниз"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Primary Button */}
        <Button
          type="button"
          variant={image.isPrimary ? "default" : "outline"}
          size="sm"
          onClick={onSetPrimary}
          className={image.isPrimary ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {image.isPrimary ? "⭐ Основное" : "Сделать основным"}
        </Button>

        {/* Delete Button */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRemove}
          title="Удалить изображение"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const isUploadingRef = useRef(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    shortName: '',
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
    topNotes: '',
    purpose: '',
    usageInstructions: '',
    brandCountry: '',
    manufactureCountry: '',
    warehouseLocation: '',
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
  const [dedupeLoading, setDedupeLoading] = useState(false);
  const [dedupeMessage, setDedupeMessage] = useState('');
  const [productDocuments, setProductDocuments] = useState<Array<{ id: string; type: string; title: string; fileUrl: string }>>([]);
  const [docUploading, setDocUploading] = useState(false);
  const [docForm, setDocForm] = useState({ type: 'certificate', title: '' });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Проверяем, что params.id существует
    if (!params?.id) {
      console.error('Product ID is missing from params');
      setError('ID товара не найден');
      setIsLoadingData(false);
      return;
    }

    loadProductData();
    loadCategoriesAndBrands();
    loadProductDocuments();
  }, [params.id]);

  const loadProductDocuments = async () => {
    if (!params?.id) return;
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/products/${params.id}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const list = await res.json();
        setProductDocuments(list);
      }
    } catch (e) {
      console.error('Load product documents error:', e);
    }
  };

  const loadProductData = async () => {
    try {
      setIsLoadingData(true);
      setError('');
      
      if (!params?.id) {
        setError('ID товара не найден');
        setIsLoadingData(false);
        return;
      }
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
        router.push('/admin/login');
        setIsLoadingData(false);
        return;
      }

      console.log('Loading product with ID:', params.id);
      console.log('Token exists:', !!token);
      console.log('Token length:', token ? token.length : 0);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'null');
      
      const response = await fetch(`/api/admin/products/${params.id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const product = await response.json();
        console.log('Product loaded:', product.name);
        setFormData({
          name: product.name || '',
          shortName: product.shortName || '',
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
          topNotes: product.topNotes || '',
          purpose: product.purpose || '',
          usageInstructions: product.usageInstructions || '',
          brandCountry: product.brandCountry || '',
          manufactureCountry: product.manufactureCountry || '',
          warehouseLocation: product.warehouseLocation || '',
          barcode: product.barcode || '',
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          categoryIds: product.productCategories?.map((pc: any) => pc.categoryId) || [],
          brandId: product.brandId || '',
          images: (() => {
            const productImages = product.images || [];
            // Если несколько изображений помечены как основные, оставляем только первое
            const primaryImages = productImages.filter((img: any) => img.isPrimary === true);
            const hasPrimary = primaryImages.length > 0;
            
            return productImages.map((img: any, index: number) => ({
              id: img.id,
              url: img.url,
              alt: img.alt || '',
              // Если есть основное изображение, используем его значение, иначе делаем первое основным
              isPrimary: hasPrimary 
                ? (img.isPrimary === true && primaryImages[0].id === img.id)
                : (index === 0),
            }));
          })(),
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        
        if (response.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          localStorage.removeItem('admin_token');
          setTimeout(() => router.push('/admin/login'), 2000);
        } else if (response.status === 404) {
          setError('Товар не найден');
        } else {
          setError(`Не удалось загрузить данные товара: ${errorData.error || 'Неизвестная ошибка'}`);
        }
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      setError(`Ошибка загрузки данных: ${error.message || 'Неизвестная ошибка'}`);
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

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= formData.images.length) return;
    
    setFormData(prev => {
      const newImages = [...prev.images];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.images.findIndex((_, i) => i.toString() === active.id);
        const newIndex = prev.images.findIndex((_, i) => i.toString() === over.id);
        
        return {
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex),
        };
      });
    }
  };

  // Настройка сенсоров для drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  /** Загрузка нескольких файлов из карточки: первый заменяет текущее изображение, остальные вставляются после */
  const handleImageFilesUpload = (index: number, files: File[]) => {
    if (files.length === 0) return;
    if (files.length === 1) {
      handleImageFileUpload(index, files[0]);
      return;
    }
    const first = files[0];
    const rest = files.slice(1);
    handleImageFileUpload(index, first);
    const readPromises = rest.map((file) => {
      return new Promise<{ url: string; alt: string; isPrimary: boolean; file: File }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: (e.target?.result as string) || '',
            alt: file.name,
            isPrimary: false,
            file,
          });
        };
        reader.onerror = () => resolve({ url: '', alt: file.name, isPrimary: false, file });
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readPromises).then((newImages) => {
      const valid = newImages.filter((img) => img.url);
      if (valid.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images.slice(0, index + 1),
            ...valid,
            ...prev.images.slice(index + 1),
          ],
        }));
      }
    });
  };

  const handleMultipleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Защита от повторного вызова во время загрузки
    if (isUploadingRef.current) {
      console.log('Upload already in progress, skipping...');
      return;
    }
    
    isUploadingRef.current = true;
    const fileArray = Array.from(files);
    
    // Получаем текущее состояние один раз для определения основного изображения
    setFormData(prev => {
      const existingImagesCount = prev.images.length;
      const hasExistingPrimary = prev.images.some(img => img.isPrimary);
      
      // Читаем все файлы параллельно
      const readPromises = fileArray.map((file, index) => {
        return new Promise<{ url: string; alt: string; isPrimary: boolean; file: File }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            resolve({
              url: imageUrl,
              alt: file.name,
              // Первое изображение из новой партии будет основным только если нет существующих изображений
              isPrimary: !hasExistingPrimary && existingImagesCount === 0 && index === 0,
              file: file,
            });
          };
          reader.onerror = () => {
            console.error('Error reading file:', file.name);
            resolve({
              url: '',
              alt: file.name,
              isPrimary: false,
              file: file,
            });
          };
          reader.readAsDataURL(file);
        });
      });
      
      // Ждем загрузки всех файлов и добавляем их все сразу
      Promise.all(readPromises).then(newImages => {
        const validImages = newImages.filter(img => img.url);
        if (validImages.length > 0) {
          setFormData(current => {
            // Проверяем, не были ли уже добавлены эти изображения
            // Сравниваем по имени файла и URL
            const existingUrls = new Set(current.images.map(img => img.url));
            const existingFileNames = new Set(current.images.map(img => img.alt));
            
            const uniqueNewImages = validImages.filter(img => 
              !existingUrls.has(img.url) && !existingFileNames.has(img.alt)
            );
            
            if (uniqueNewImages.length > 0) {
              return {
                ...current,
                images: [...current.images, ...uniqueNewImages],
              };
            }
            return current;
          });
        }
        // Сбрасываем флаг загрузки после завершения
        isUploadingRef.current = false;
      }).catch(error => {
        console.error('Error uploading images:', error);
        isUploadingRef.current = false;
      });
      
      return prev; // Возвращаем предыдущее состояние, изменения применятся асинхронно через Promise.all
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

  const handleDedupeImages = async () => {
    if (!params?.id) return;
    setDedupeMessage('');
    setDedupeLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setDedupeMessage('Нужна авторизация');
        return;
      }
      const res = await fetch(`/api/admin/products/${params.id}/dedupe-images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDedupeMessage(data.error || 'Ошибка запроса');
        return;
      }
      setDedupeMessage(data.deleted ? `Удалено дубликатов: ${data.deleted}` : (data.message || 'Готово'));
      await loadProductData();
    } finally {
      setDedupeLoading(false);
    }
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
                  <Label htmlFor="name">Полное название товара *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortName">Краткое название (для заголовка H1)</Label>
                  <Input
                    id="shortName"
                    value={formData.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    placeholder="Например: Ароматическая свеча ESPERYDIO 210 гр"
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
                  <Label htmlFor="topNotes">Основные ноты</Label>
                  <Textarea
                    id="topNotes"
                    value={formData.topNotes}
                    onChange={(e) => handleInputChange('topNotes', e.target.value)}
                    placeholder="Например: Бергамот, лимон, лаванда"
                    rows={2}
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="usageInstructions">Способ применения</Label>
                  <Textarea
                    id="usageInstructions"
                    value={formData.usageInstructions}
                    onChange={(e) => handleInputChange('usageInstructions', e.target.value)}
                    placeholder="Инструкция по применению товара"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandCountry">Страна происхождения бренда</Label>
                  <Input
                    id="brandCountry"
                    value={formData.brandCountry}
                    onChange={(e) => handleInputChange('brandCountry', e.target.value)}
                    placeholder="Например: Франция"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufactureCountry">Страна производства</Label>
                  <Input
                    id="manufactureCountry"
                    value={formData.manufactureCountry}
                    onChange={(e) => handleInputChange('manufactureCountry', e.target.value)}
                    placeholder="Например: Италия"
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

                <div className="space-y-2">
                  <Label htmlFor="warehouseLocation">Место товара (только для админки)</Label>
                  <Input
                    id="warehouseLocation"
                    value={formData.warehouseLocation}
                    onChange={(e) => handleInputChange('warehouseLocation', e.target.value)}
                    placeholder="Место на складе"
                  />
                  <p className="text-xs text-muted-foreground">Не отображается пользователям</p>
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
              <div id="upload-multiple" className="mb-4 p-4 border-2 border-dashed border-primary/40 rounded-lg bg-primary/5">
                <Label className="text-base font-semibold mb-2 block">Загрузить несколько изображений сразу</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleMultipleImageUpload(files);
                    }
                    setTimeout(() => {
                      if (e.target) e.target.value = '';
                    }, 0);
                  }}
                  className="mt-1 cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Выберите несколько файлов: <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Ctrl</kbd> (Win) или <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Cmd</kbd> (Mac) + клик. Или используйте выбор нескольких файлов в любой карточке ниже.
                </p>
              </div>
              
              {formData.images.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Нет изображений. Загрузите изображения выше или добавьте вручную.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={formData.images.map((_, i) => i.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {formData.images.map((image, index) => (
                        <SortableImageItem
                          key={index}
                          image={image}
                          index={index}
                          total={formData.images.length}
                          onUpdate={(field, value) => updateImage(index, field, value)}
                          onRemove={() => removeImage(index)}
                          onSetPrimary={() => setPrimaryImage(index)}
                          onMove={(direction) => {
                            const newIndex = direction === 'up' ? index - 1 : index + 1;
                            moveImage(index, newIndex);
                          }}
                          onFileUpload={(file) => handleImageFileUpload(index, file)}
                          onFilesUpload={(files) => handleImageFilesUpload(index, files)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImage}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Добавить изображение
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDedupeImages}
                  disabled={dedupeLoading || formData.images.length === 0}
                  className="flex-1"
                  title="Оставить по одному изображению на каждый URL (первое по порядку)"
                >
                  <CopyMinus className="h-4 w-4 mr-2" />
                  {dedupeLoading ? 'Проверка...' : 'Удалить дубли фото'}
                </Button>
              </div>
              {dedupeMessage && (
                <p className="text-sm text-muted-foreground">{dedupeMessage}</p>
              )}
            </CardContent>
          </Card>

          {/* Документы на товар */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Документы на товар
              </CardTitle>
              <CardDescription>
                Сертификаты, декларации соответствия, отказные письма — загрузите PDF или изображения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end p-4 border rounded-lg bg-muted/30">
                <div className="flex-1 min-w-[200px]">
                  <Label>Тип документа</Label>
                  <Select
                    value={docForm.type}
                    onValueChange={(v) => setDocForm((f) => ({ ...f, type: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Сертификат гос. регистрации</SelectItem>
                      <SelectItem value="declaration">Декларация соответствия</SelectItem>
                      <SelectItem value="refusal">Отказное письмо</SelectItem>
                      <SelectItem value="other">Прочее</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label>Название (как показывать на сайте)</Label>
                  <Input
                    value={docForm.title}
                    onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Например: Декларация ЕАЭС"
                    className="mt-1"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label>Файл (PDF, JPG, PNG, DOC)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    className="mt-1 cursor-pointer"
                    id="product-doc-file"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !params?.id) return;
                      setDocUploading(true);
                      try {
                        const fd = new FormData();
                        fd.set('file', file);
                        fd.set('type', docForm.type);
                        fd.set('title', docForm.title || file.name);
                        const token = localStorage.getItem('admin_token');
                        const res = await fetch(`/api/admin/products/${params.id}/documents`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                          body: fd,
                        });
                        if (res.ok) {
                          await loadProductDocuments();
                          setDocForm({ type: 'certificate', title: '' });
                          e.target.value = '';
                        } else {
                          const data = await res.json().catch(() => ({}));
                          alert(data.error || 'Ошибка загрузки');
                        }
                      } catch (err) {
                        alert('Ошибка загрузки');
                      } finally {
                        setDocUploading(false);
                      }
                    }}
                  />
                </div>
                <Button type="button" disabled={docUploading}>
                  {docUploading ? 'Загрузка...' : 'Добавить документ'}
                </Button>
              </div>
              {productDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет загруженных документов. Добавьте сертификат или декларацию — они отобразятся на странице товара.</p>
              ) : (
                <ul className="space-y-2">
                  {productDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-2 p-2 rounded border bg-background">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0" />
                        {doc.title}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={async () => {
                          if (!confirm('Удалить документ?')) return;
                          const token = localStorage.getItem('admin_token');
                          const res = await fetch(`/api/admin/products/documents/${doc.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.ok) await loadProductDocuments();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
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
