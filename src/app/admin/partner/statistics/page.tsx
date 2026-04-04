'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { ArrowLeft, BarChart3, Download, Loader2, Package, TrendingUp, ShoppingBag } from 'lucide-react';

interface ProductStat {
  productId: string;
  productName: string;
  sku: string | null;
  brandName: string;
  totalQuantity: number;
  totalRevenue: number;
  currentStock: number;
}

interface Summary {
  totalProducts: number;
  totalItemsSold: number;
  totalRevenue: number;
}

export default function PartnerStatisticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ProductStat[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalProducts: 0, totalItemsSold: 0, totalRevenue: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState(firstOfMonth.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);

      const res = await fetch(`/api/admin/partner/statistics?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setSummary(data.summary);
      }
    } catch {
      console.error('Error loading statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExportCSV = () => {
    const header = 'Бренд;Товар;Артикул;Продано шт.;Выручка ₽;Остаток\n';
    const rows = stats.map((s) =>
      `${s.brandName};${s.productName};${s.sku || ''};${s.totalQuantity};${s.totalRevenue.toFixed(2)};${s.currentStock}`
    ).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistics_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Статистика продаж</h1>
          <p className="text-muted-foreground">Аналитика по вашим брендам</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label>Дата от</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>Дата до</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <Button onClick={fetchStats} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Показать
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={stats.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Экспорт CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Товаров продано</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">уникальных позиций</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Продано штук</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItemsSold}</div>
            <p className="text-xs text-muted-foreground">за период</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRevenue.toLocaleString('ru-RU')} ₽</div>
            <p className="text-xs text-muted-foreground">за период</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Детализация по товарам</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : stats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Нет данных за выбранный период
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead>Артикул</TableHead>
                    <TableHead className="text-right">Продано, шт.</TableHead>
                    <TableHead className="text-right">Выручка, ₽</TableHead>
                    <TableHead className="text-right">Остаток</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((s) => (
                    <TableRow key={s.productId}>
                      <TableCell className="font-medium">{s.brandName}</TableCell>
                      <TableCell>{s.productName}</TableCell>
                      <TableCell className="text-muted-foreground">{s.sku || '—'}</TableCell>
                      <TableCell className="text-right">{s.totalQuantity}</TableCell>
                      <TableCell className="text-right">{s.totalRevenue.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="text-right">{s.currentStock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
