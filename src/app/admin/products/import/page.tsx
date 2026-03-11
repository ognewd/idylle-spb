'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Upload, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface FileColumn {
  index: number;
  name: string;
}

interface ImportProduct {
  rowNum: number;
  name: string;
  slug: string;
  shortName: string | null;
  description: string | null;
  shortDescription: string | null;
  myWarehouseCode: string | null;
  manufacturerSku: string | null;
  sku: string | null;
  productType: string | null;
  categoryName: string | null;
  stock: number;
  price: number;
  comparePrice: number | null;
  volume: string | null;
  weight: number | null;
  dimensions: string | null;
  aromaDescription: string | null;
  topNotes: string | null;
  aromaFamily: string | null;
  gender: string | null;
  purpose: string | null;
  usageInstructions: string | null;
  ingredients: string | null;
  brandName: string;
  brandCountry: string | null;
  manufactureCountry: string | null;
  warehouseLocation: string | null;
  barcode: string | null;
  isActive: boolean | null;
  isFeatured: boolean | null;
  photoUrl: string | null;
  additionalImageUrls: string[];
  isUpdate: boolean;
  existingProductId: string | null;
  rawData: Record<number, any>;
}

interface ImportStats {
  total: number;
  new: number;
  updates: number;
  errors: number;
}

const FIELD_LABELS: Record<string, string> = {
  // Обязательные и основные
  name: 'Наименование *',
  brand: 'Бренд',
  category: 'Категория',
  price: 'Цена продажи',
  comparePrice: 'Цена до скидки (сравнение)',
  stock: 'Доступно (остаток)',
  // Названия и описания
  shortName: 'Краткое название',
  description: 'Описание (полное)',
  shortDescription: 'Краткое описание',
  // Артикулы и идентификаторы
  sku: 'Артикул (SKU)',
  myWarehouseCode: 'Код Мой склад',
  manufacturerSku: 'Артикул производителя',
  barcode: 'Штрихкод',
  // Характеристики
  volume: 'Объем, мл или гр',
  weight: 'Вес, г',
  dimensions: 'Габариты',
  productType: 'Вид товара (для фильтра)',
  // Аромат
  aromaDescription: 'Описание аромата',
  topNotes: 'Основные ноты',
  aromaFamily: 'Семейство аромата',
  gender: 'Пол (мужской/женский/унисекс)',
  // Использование
  purpose: 'Назначение (для какого помещения)',
  usageInstructions: 'Способ применения',
  ingredients: 'Состав',
  // География
  brandCountry: 'Страна происхождения бренда',
  manufactureCountry: 'Страна производства',
  warehouseLocation: 'Место на складе',
  // Флаги
  isActive: 'Активен (да/нет)',
  isFeatured: 'Рекомендуемый (да/нет)',
  // Медиа
  photo: 'Фото (URL)',
  additionalPhotos: 'Доп. изображения (URL через запятую)',
};

export default function ImportProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'result'>('upload');
  const [fileColumns, setFileColumns] = useState<FileColumn[]>([]);
  const [rowsPreview, setRowsPreview] = useState<any[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, number | null>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [parsedData, setParsedData] = useState<{
    products: ImportProduct[];
    errors: string[];
    stats: ImportStats;
    columns: FileColumn[];
    columnMappingInfo?: {
      photo?: { index: number; name: string; found: boolean } | { found: false; message: string };
      additionalPhotos?: { index: number; name: string; found: boolean } | { found: false; message: string };
    };
  } | null>(null);
  const [applyResults, setApplyResults] = useState<{
    created: number;
    updated: number;
    errors: string[];
    photoErrors?: string[];
  } | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [importMode, setImportMode] = useState<'update' | 'replace'>('update');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xls|xlsx)$/i)) {
        alert('Поддерживаются только файлы Excel (.xls, .xlsx)');
        return;
      }
      setFile(selectedFile);
      setParsedData(null);
      setApplyResults(null);
      setStep('upload');
    }
  };

  const handleLoadColumns = async () => {
    if (!file) {
      alert('Выберите файл');
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setIsParsing(true);
    setProgressMessage('Загрузка и обработка файла...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import/parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Стандартный шаблон: сервер сразу вернул товары — переходим к превью
        if (data.products) {
          setParsedData(data);
          setStep('preview');
          return;
        }
        // Нестандартные колонки: показываем шаг выбора соответствия
        setFileColumns(data.columns || []);
        setRowsPreview(data.rowsPreview || []);
        const initialMapping: Record<string, number | null> = {};
        Object.keys(FIELD_LABELS).forEach(field => {
          if (data.suggestedMapping && data.suggestedMapping[field] !== undefined) {
            initialMapping[field] = data.suggestedMapping[field];
          } else {
            initialMapping[field] = null;
          }
        });
        setColumnMapping(initialMapping);
        setStep('mapping');
      } else {
        alert(data.error || 'Ошибка при обработке файла');
      }
    } catch (error: any) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      setIsParsing(false);
      setProgressMessage('');
    }
  };

  const handleParse = async () => {
    if (!file) {
      alert('Выберите файл');
      return;
    }

    if (!columnMapping.name && columnMapping.name !== 0) {
      alert('Необходимо указать соответствие для поля "Наименование"');
      return;
    }

    setIsParsing(true);
    setProgressMessage('Обработка файла...');
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('columnMapping', JSON.stringify(columnMapping));

      const response = await fetch('/api/admin/import/parse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setParsedData(data);
        setStep('preview');
      } else {
        alert(data.error || 'Ошибка при обработке файла');
      }
    } catch (error: any) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      setIsParsing(false);
      setProgressMessage('');
    }
  };

  const handleApply = async () => {
    if (!parsedData || parsedData.products.length === 0) {
      alert('Нет данных для импорта');
      return;
    }

    if (!confirm(`Импортировать ${parsedData.stats.total} товаров?`)) {
      return;
    }

    setIsApplying(true);
    setProgressMessage(`Импорт товаров (${parsedData.stats.total} шт.)...`);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/import/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: parsedData.products,
          importMode: importMode, // 'update' или 'replace'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setApplyResults(data.results);
        setStep('result');
      } else {
        alert(data.error || 'Ошибка при применении импорта');
      }
    } catch (error: any) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      setIsApplying(false);
      setProgressMessage('');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ товары из базы данных?\n\nЭто действие нельзя отменить!')) {
      return;
    }

    // Дополнительное подтверждение
    if (!confirm('Это удалит ВСЕ товары без возможности восстановления!\n\nВы действительно уверены?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/products/delete-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Успешно удалено товаров: ${data.deleted}`);
        // Очищаем состояние
        setFile(null);
        setParsedData(null);
        setApplyResults(null);
        setStep('upload');
        setShowAllErrors(false);
      } else {
        alert(data.error || 'Ошибка при удалении товаров');
      }
    } catch (error: any) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Логика сворачивания ошибок
  const getDisplayedErrors = () => {
    if (!parsedData?.errors || parsedData.errors.length === 0) return [];
    if (showAllErrors || parsedData.errors.length <= 10) {
      return parsedData.errors;
    }
    return parsedData.errors.slice(0, 10);
  };
  
  const displayedErrors = getDisplayedErrors();
  const hasMoreErrors = parsedData?.errors && parsedData.errors.length > 10 && !showAllErrors;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/products')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Импорт товаров</h1>
                <p className="text-gray-600">Загрузка товаров из Excel файла</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/products/update-stocks">Обновление остатков</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Индикатор прогресса при загрузке/импорте */}
        {(isParsing || isApplying) && progressMessage && (
          <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 shrink-0 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{progressMessage}</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Шаг 1: Загрузка файла */}
        {step === 'upload' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Шаг 1: Загрузка файла</CardTitle>
              <CardDescription>
                Загрузите Excel с колонками: Код Мой склад, Артикул производителя, Полное название, Краткое название, Категория, Тип категории, Мест товара, Доступно, Цена продажи, Описание аромата, Основные ноты, Объем/Вес/Размеры, Назначение, Способ применения, Бренд, Страны, Штрихкод. Соответствие подставится автоматически.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Превью колонок и первых 5 строк */}
                {fileColumns.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Колонки и пример первых 5 строк
                    </h4>
                    <div className="overflow-x-auto">
                      <div className="flex gap-3 min-w-max">
                        {fileColumns.map((col) => (
                          <div key={col.index} className="w-56 bg-white border rounded-md">
                            <div className="px-3 py-2 border-b bg-gray-50 text-sm font-medium">
                              {col.name || `Колонка ${col.index + 1}`}
                            </div>
                            <ul className="divide-y">
                              {rowsPreview.length > 0 ? (
                                rowsPreview.slice(0, 5).map((row, i) => (
                                  <li key={i} className="px-3 py-1.5 text-xs text-gray-700 truncate">
                                    {String(row[col.index] ?? '')}
                                  </li>
                                ))
                              ) : (
                                <li className="px-3 py-2 text-xs text-gray-400">
                                  Нет данных для превью
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-gray-700">
                    Выберите Excel‑файл для импорта (.xls, .xlsx)
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      ref={fileInputRef}
                      id="excel-file"
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Выбрать файл
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {file ? <span>Файл: <strong>{file.name}</strong></span> : 'Файл не выбран'}
                    </div>
                  </div>
                  <Button
                    onClick={handleLoadColumns}
                    disabled={!file || isParsing}
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить и обработать
                      </>
                    )}
                  </Button>
                </div>
                {file && (
                  <p className="text-sm text-gray-600">
                    Выбран файл: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} КБ)
                  </p>
                )}
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="w-full"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Удаление...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить все товары
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Внимание: это действие удалит все товары из базы данных
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Шаг 2: Выбор соответствия колонок */}
        {step === 'mapping' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Шаг 2: Выбор соответствия колонок</CardTitle>
              <CardDescription>
                Укажите, какая колонка файла соответствует какому полю товара
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Повтор превью и колонок в маппинге для удобства */}
                {fileColumns.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Колонки файла и первые 5 строк
                    </h4>
                    <div className="overflow-x-auto">
                      <div className="flex gap-3 min-w-max">
                        {fileColumns.map((col) => (
                          <div key={col.index} className="w-56 bg-white border rounded-md">
                            <div className="px-3 py-2 border-b bg-gray-50 text-sm font-medium">
                              {col.name || `Колонка ${col.index + 1}`}
                            </div>
                            <ul className="divide-y">
                              {rowsPreview.length > 0 ? (
                                rowsPreview.slice(0, 5).map((row, i) => (
                                  <li key={i} className="px-3 py-1.5 text-xs text-gray-700 truncate">
                                    {String(row[col.index] ?? '')}
                                  </li>
                                ))
                              ) : (
                                <li className="px-3 py-2 text-xs text-gray-400">
                                  Нет данных для превью
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(FIELD_LABELS).map(([field, label]) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`mapping-${field}`}>{label}</Label>
                      <Select
                        value={columnMapping[field] !== null && columnMapping[field] !== undefined 
                          ? columnMapping[field]!.toString() 
                          : undefined}
                        onValueChange={(value) => {
                          setColumnMapping({
                            ...columnMapping,
                            [field]: value === 'none' ? null : parseInt(value),
                          });
                        }}
                      >
                        <SelectTrigger id={`mapping-${field}`}>
                          <SelectValue placeholder="Выберите колонку" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не выбрано</SelectItem>
                          {fileColumns.map((col) => (
                            <SelectItem key={col.index} value={col.index.toString()}>
                              {col.name || `Колонка ${col.index + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Назад
                  </Button>
                  <Button onClick={handleParse} disabled={isParsing}>
                    {isParsing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Обработать файл
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Шаг 3: Предварительный просмотр */}
        {step === 'preview' && parsedData && (
          <>
            <Card className="mb-24">
              <CardHeader>
                <CardTitle>Шаг 3: Предварительный просмотр</CardTitle>
                <CardDescription>
                  Проверьте данные перед импортом
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Выбор режима импорта */}
                  <div className="rounded-lg border bg-blue-50 p-4">
                    <Label className="text-base font-semibold mb-3 block">Режим импорта для существующих товаров:</Label>
                    <RadioGroup value={importMode} onValueChange={(value) => setImportMode(value as 'update' | 'replace')}>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="update" id="update" />
                        <Label htmlFor="update" className="cursor-pointer">
                          <span className="font-medium">Обновить</span> — дополняем существующий товар информацией из файла, не перезаписывая существующие данные. 
                          Если есть фото в файле — добавляем их как дополнительные, сохраняя текущие.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="replace" id="replace" />
                        <Label htmlFor="replace" className="cursor-pointer">
                          <span className="font-medium">Удалить и загрузить заново</span> — полностью перезагружаем товар с информацией из файла. 
                          Старые изображения будут удалены.
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Кнопка применения — сверху, без прокрутки */}
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      Готовы применить импорт? Товаров: <strong>{parsedData.stats.total}</strong>
                    </p>
                    <Button
                      onClick={handleApply}
                      disabled={isApplying || parsedData.products.length === 0}
                      size="lg"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Импорт...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Применить импорт ({parsedData.stats.total} товаров)
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Статистика */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Всего товаров</div>
                    <div className="text-2xl font-bold text-blue-600">{parsedData.stats.total}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Новых товаров</div>
                    <div className="text-2xl font-bold text-green-600">{parsedData.stats.new}</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Будет обновлено</div>
                    <div className="text-2xl font-bold text-yellow-600">{parsedData.stats.updates}</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Ошибок</div>
                    <div className="text-2xl font-bold text-red-600">{parsedData.stats.errors}</div>
                  </div>
                </div>

                {/* Информация о распознавании колонок */}
                {parsedData.columnMappingInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-800 mb-3">Информация о распознавании колонок:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {parsedData.columnMappingInfo.photo?.found ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-700">
                              Основное изображение: найдена колонка "{parsedData.columnMappingInfo.photo.name}" (индекс {parsedData.columnMappingInfo.photo.index})
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-yellow-700">
                              Основное изображение: {parsedData.columnMappingInfo.photo?.message || 'не найдена'}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {parsedData.columnMappingInfo.additionalPhotos?.found ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-700">
                              Дополнительные изображения: найдена колонка "{parsedData.columnMappingInfo.additionalPhotos.name}" (индекс {parsedData.columnMappingInfo.additionalPhotos.index})
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-700">
                              Дополнительные изображения: {parsedData.columnMappingInfo.additionalPhotos?.message || 'не найдена'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ошибки */}
                {parsedData.errors && parsedData.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-800">Ошибки при обработке:</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {displayedErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                    {hasMoreErrors && (
                      <Button
                        variant="link"
                        className="mt-3 text-red-700 p-0 h-auto font-semibold"
                        onClick={() => setShowAllErrors(true)}
                      >
                        Смотреть все
                      </Button>
                    )}
                  </div>
                )}

                {/* Таблица товаров (первые 10) */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Строка</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Бренд</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Остаток</th>
                        {parsedData.columns.map((col) => (
                          <th key={col.index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {col.name || `Колонка ${col.index + 1}`}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.products.slice(0, 10).map((product) => (
                        <tr key={product.rowNum}>
                          <td className="px-4 py-3 text-sm text-gray-500">{product.rowNum}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{product.brandName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{product.categoryName || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{product.price.toLocaleString()} ₽</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{product.stock}</td>
                          {parsedData.columns.map((col) => (
                            <td key={col.index} className="px-4 py-3 text-sm text-gray-500">
                              {product.rawData?.[col.index] !== undefined 
                                ? String(product.rawData[col.index] || '')
                                : '-'}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-sm">
                            {product.isUpdate ? (
                              <span className="inline-flex items-center gap-1 text-yellow-600">
                                <AlertCircle className="h-4 w-4" />
                                Обновление
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Создание
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.products.length > 10 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Показано 10 из {parsedData.products.length} товаров
                    </p>
                  )}
                </div>

                {/* Кнопка применения — дублируем внизу для удобства */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleApply}
                    disabled={isApplying || parsedData.products.length === 0}
                    size="lg"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Импорт...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Применить импорт ({parsedData.stats.total} товаров)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

            {/* Фиксированная панель внизу экрана — кнопка всегда под рукой */}
            <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white/95 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] backdrop-blur-sm">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <span className="text-sm text-gray-600">
                  Импорт: <strong>{parsedData.stats.total}</strong> товаров
                </span>
                <Button
                  onClick={handleApply}
                  disabled={isApplying || parsedData.products.length === 0}
                  size="lg"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Импорт...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Применить импорт ({parsedData.stats.total} товаров)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Результаты импорта */}
        {step === 'result' && applyResults && (
          <Card>
            <CardHeader>
              <CardTitle>Результаты импорта</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Создано товаров</div>
                    <div className="text-2xl font-bold text-green-600">{applyResults.created}</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Обновлено товаров</div>
                    <div className="text-2xl font-bold text-yellow-600">{applyResults.updated}</div>
                  </div>
                </div>

                {applyResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-800">Ошибки при импорте:</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {applyResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {applyResults.photoErrors && applyResults.photoErrors.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <h3 className="font-semibold text-amber-800">Фото не загружены (товары созданы/обновлены):</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                      {applyResults.photoErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setParsedData(null);
                      setApplyResults(null);
                      setStep('upload');
                      setShowAllErrors(false);
                    }}
                  >
                    Загрузить новый файл
                  </Button>
                  <Button onClick={() => router.push('/admin/products')}>
                    Перейти к товарам
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
