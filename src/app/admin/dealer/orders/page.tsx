'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

type DealerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number; price: number }>;
};

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтвержден',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  failed: 'Ошибка',
  refunded: 'Возврат',
};

export default function DealerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch('/api/admin/dealer/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Не удалось загрузить заказы');
        }
        setOrders(data.orders || []);
      } catch (e: any) {
        setError(e?.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Мои заказы</h1>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Загрузка заказов...</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">У вас пока нет заказов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                    <span>{order.orderNumber}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{statusLabels[order.status] || order.status}</Badge>
                    <Badge variant="outline">{paymentStatusLabels[order.paymentStatus] || order.paymentStatus}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Товаров: {itemsCount}
                  </div>
                  <div className="text-lg font-semibold">
                    {Number(order.total).toLocaleString('ru-RU')} ₽
                  </div>
                  <div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/dealer/orders/${order.id}`}>Открыть детали</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

