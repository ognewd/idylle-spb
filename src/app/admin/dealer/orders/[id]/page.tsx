'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DealerOrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryMethod: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string | null;
  inn: string | null;
  kpp: string | null;
  companyAddress: string | null;
  notes: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantInfo: string | null;
    quantity: number;
    price: number;
  }>;
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

const paymentMethodLabels: Record<string, string> = {
  card: 'Банковская карта онлайн',
  invoice: 'Безналичный расчет',
  cash: 'Наличные',
  pickup: 'Оплата при самовывозе',
};

const deliveryMethodLabels: Record<string, string> = {
  pickup: 'Самовывоз',
  delivery: 'Доставка',
  cdek: 'СДЭК',
};

export default function DealerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<DealerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`/api/admin/dealer/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Не удалось загрузить заказ');
        }
        setOrder(data.order);
      } catch (e: any) {
        setError(e?.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-muted-foreground">Загрузка заказа...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/dealer/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к моим заказам
          </Link>
        </Button>
        <p className="text-sm text-red-600">{error || 'Заказ не найден'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <Link href="/admin/dealer/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к моим заказам
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-2">
            <span>Заказ {order.orderNumber}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {new Date(order.createdAt).toLocaleString('ru-RU')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{statusLabels[order.status] || order.status}</Badge>
            <Badge variant="outline">{paymentStatusLabels[order.paymentStatus] || order.paymentStatus}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Компания: </span>
              <span>{order.companyName || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Контакт: </span>
              <span>{`${order.firstName} ${order.lastName}`.trim() || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span>{order.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Телефон: </span>
              <span>{order.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Доставка: </span>
              <span>{deliveryMethodLabels[order.deliveryMethod] || order.deliveryMethod}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Оплата: </span>
              <span>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
            </div>
          </div>
          {(order.inn || order.kpp || order.companyAddress) && (
            <div className="pt-2 border-t text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">ИНН: </span>
                <span>{order.inn || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">КПП: </span>
                <span>{order.kpp || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Адрес компании: </span>
                <span>{order.companyAddress || '—'}</span>
              </div>
            </div>
          )}
          {order.notes && (
            <div className="pt-2 border-t text-sm">
              <span className="text-muted-foreground">Комментарий к заказу: </span>
              <span>{order.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Состав заказа</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead className="text-center">Кол-во</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.variantInfo && (
                        <p className="text-xs text-muted-foreground">{item.variantInfo}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{Number(item.price).toLocaleString('ru-RU')} ₽</TableCell>
                  <TableCell className="text-right">
                    {(Number(item.price) * item.quantity).toLocaleString('ru-RU')} ₽
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Товары</span>
              <span>{Number(order.subtotal).toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Доставка</span>
              <span>{Number(order.shipping).toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-1">
              <span>Итого</span>
              <span>{Number(order.total).toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

