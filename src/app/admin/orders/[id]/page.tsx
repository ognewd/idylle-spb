'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  FileText, 
  Save,
  Truck,
  Building2,
  Phone,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productName: string;
  variantInfo: string | null;
  quantity: number;
  price: number;
  product?: {
    name: string;
    images: { url: string }[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: string;
  paymentMethod: string;
  city: string | null;
  deliveryAddress: string | null;
  companyName: string | null;
  inn: string | null;
  kpp: string | null;
  companyAddress: string | null;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setStatus(data.order.status);
        setPaymentStatus(data.order.paymentStatus);
        setAdminNotes(data.order.notes || '');
      } else {
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          paymentStatus,
          notes: adminNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        alert('Заказ успешно обновлен!');
      } else {
        alert('Ошибка при сохранении заказа');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Ошибка при сохранении заказа');
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      confirmed: 'Подтвержден',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен',
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает оплаты',
      paid: 'Оплачен',
      failed: 'Ошибка',
      refunded: 'Возврат',
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: 'Банковская карта',
      invoice: 'Безналичный расчет',
      cash: 'Наличные при получении',
      pickup: 'Оплата при самовывозе',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка заказа...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к заказам
          </Link>
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Заказ {order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Создан {new Date(order.createdAt).toLocaleString('ru-RU')}
            </p>
          </div>
          
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Товары в заказе
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead className="text-center">Количество</TableHead>
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
                            <p className="text-sm text-muted-foreground">
                              {item.variantInfo}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {Number(item.price).toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(Number(item.price) * item.quantity).toLocaleString('ru-RU')} ₽
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Сумма товаров:</span>
                  <span>{Number(order.subtotal).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доставка:</span>
                  <span>{Number(order.shipping).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Итого:</span>
                  <span>{Number(order.total).toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Информация о клиенте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Имя</Label>
                  <p className="font-medium">{order.firstName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Фамилия</Label>
                  <p className="font-medium">{order.lastName}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p className="font-medium">{order.email}</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Телефон
                </Label>
                <p className="font-medium">{order.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {order.deliveryMethod === 'delivery' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Адрес доставки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-muted-foreground text-sm">Город</Label>
                  <p className="font-medium">{order.city || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Адрес</Label>
                  <p className="font-medium">{order.deliveryAddress || '—'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          {order.paymentMethod === 'invoice' && order.companyName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Реквизиты компании
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-muted-foreground text-sm">Название</Label>
                  <p className="font-medium">{order.companyName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">ИНН</Label>
                    <p className="font-medium">{order.inn || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">КПП</Label>
                    <p className="font-medium">{order.kpp || '—'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Адрес компании</Label>
                  <p className="font-medium">{order.companyAddress || '—'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Management */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Статус заказа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Статус заказа</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ожидает</SelectItem>
                    <SelectItem value="confirmed">Подтвержден</SelectItem>
                    <SelectItem value="shipped">Отправлен</SelectItem>
                    <SelectItem value="delivered">Доставлен</SelectItem>
                    <SelectItem value="cancelled">Отменен</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Текущий статус</Label>
                <div className="mt-2">
                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Статус оплаты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentStatus">Статус оплаты</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="paymentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ожидает оплаты</SelectItem>
                    <SelectItem value="paid">Оплачен</SelectItem>
                    <SelectItem value="failed">Ошибка</SelectItem>
                    <SelectItem value="refunded">Возврат</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Текущий статус</Label>
                <div className="mt-2">
                  <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-muted-foreground text-sm">Способ оплаты</Label>
                <p className="font-medium mt-1">{getPaymentMethodLabel(order.paymentMethod)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Примечания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Добавьте примечания к заказу..."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о заказе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Номер:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Создан:</span>
                <span>{new Date(order.createdAt).toLocaleString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Обновлен:</span>
                <span>{new Date(order.updatedAt).toLocaleString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Способ доставки:</span>
                <span>{order.deliveryMethod === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



