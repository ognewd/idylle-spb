'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Upload, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface FileColumn {
  index: number;
  name: string;
}

interface ImportProduct {
  rowNum: number;
  name: string;
  slug: string;
  myWarehouseCode: string | null;
  manufacturerSku: string | null;
  productType: string | null;
  categoryName: string | null;
  stock: number;
  price: number;
  aromaDescription: string | null;
  topNotes: string | null;
  volume: string | null;
  purpose: string | null;
  brandName: string;
  country: string | null;
  barcode: string | null;
  isUpdate: boolean;
  existingProductId: string | null;
  // Все остальные колонки из файла
  rawData: Record<number, any>;
}

interface ImportStats {
  total: number;
  new: number;
  updates: number;
  errors: number;
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Наименование *',
  myWarehouseCode: 'Код Мой склад',
  manufacturerSku: 'Артикул производителя',
  productType: 'Для фильтра (Вид товара)',
  category: 'Категория',
  stock: 'Доступно',
  price: 'Цена продажи',
  aromaDescription: 'Описание аромата',
  topNotes: 'Основные ноты',
  volume: 'Объем, мл или гр',
  purpose: 'Назначение (Для какого помещения)',
  brand: 'Бренд',
  country: 'Страна',
  barcode: 'Штрихкод',
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
  } | null>(null);
  const [applyResults, setApplyResults] = useState<{
    created: number;
    updated: number;
    errors: string[];
  } | null>(null);

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

    setIsParsing(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

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
        setFileColumns(data.columns || []);
        setRowsPreview(data.rowsPreview || []);
        // Инициализируем маппинг предложенными значениями
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Шаг 1: Загрузка файла */}
        {step === 'upload' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Шаг 1: Загрузка файла</CardTitle>
              <CardDescription>
                Загрузите Excel файл (.xls, .xlsx) с данными о товарах
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
                        Загрузить
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Шаг 3: Предварительный просмотр</CardTitle>
              <CardDescription>
                Проверьте данные перед импортом
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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

                {/* Кнопка применения */}
                <div className="flex justify-end">
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
