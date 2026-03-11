'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, Loader2, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UpdateStocksPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    updated: number;
    notFound: string[];
    total: number;
    message: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.name.match(/\.(xls|xlsx)$/i)) {
        alert('Поддерживаются только файлы Excel (.xls, .xlsx)');
        return;
      }
      setFile(f);
      setResult(null);
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Выберите файл');
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/import/apply-stock-update', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Ошибка обновления остатков');
        return;
      }
      setResult({
        updated: data.updated ?? 0,
        notFound: data.notFound ?? [],
        total: data.total ?? 0,
        message: data.message ?? '',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  const downloadNotFoundExcel = () => {
    if (!result?.notFound.length) return;
    const ws = XLSX.utils.aoa_to_sheet([
      ['Код Мой склад'],
      ...result.notFound.map((code) => [code]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Коды без товара');
    XLSX.writeFile(wb, 'коды_без_товара_на_сайте.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Обновление остатков</h1>
              <p className="text-gray-600 text-sm">Только код Мой склад, остаток и опционально цена. Без удаления товаров и фото.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Файл для обновления
            </CardTitle>
            <CardDescription>
              В файле должны быть колонки: <strong>Код Мой склад</strong>, <strong>Остаток</strong> (или «Доступно»). Опционально — <strong>Цена</strong>. Товары ищутся по коду МС; обновляются только остаток и цена, фото и остальные данные не меняются.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Button type="submit" disabled={!file || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Обновление...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Обновить остатки
                    </>
                  )}
                </Button>
              </div>
              {file && (
                <p className="text-sm text-gray-500">Выбран файл: {file.name}</p>
              )}
            </form>

            {result && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <p className="font-medium text-gray-900">{result.message}</p>
                {result.notFound.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={downloadNotFoundExcel}>
                      <Download className="h-4 w-4 mr-2" />
                      Скачать коды, которых нет на сайте (Excel)
                    </Button>
                    <span className="text-sm text-gray-500">
                      {result.notFound.length} кодов не найдено
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-sm text-gray-500">
          <Link href="/admin/products/import" className="text-blue-600 hover:underline">
            Импорт товаров
          </Link>
          {' '}
          — полный импорт/обновление из Excel. Обновление остатков — только код МС, остаток и цена.
        </p>
      </div>
    </div>
  );
}
