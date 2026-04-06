'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Search, Eye, Filter, Package, CreditCard, FileText, Banknote, Store } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  orderType?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: any[];
  cdekDeliveryType?: string | null;
  cdekPvzAddress?: string | null;
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

const paymentMethodIcons = {
  card: CreditCard,
  invoice: FileText,
  cash: Banknote,
  pickup: Store,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'dealer' | 'retail'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
    const matchesOrderType =
      orderTypeFilter === 'all' || (order.orderType || 'retail') === orderTypeFilter;

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesOrderType;
  });

  const getDeliveryMethodLabel = (order: Order) => {
    if (order.deliveryMethod === 'delivery') return '🚚 Доставка курьером';
    if (order.deliveryMethod === 'pickup') return '🏪 Самовывоз';
    if (order.deliveryMethod === 'cdek') {
      if (order.cdekDeliveryType === 'pvz' && order.cdekPvzAddress) return `📦 СДЭК ПВЗ`;
      return '🚚 СДЭК курьер';
    }
    return order.deliveryMethod;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: 'Карта онлайн',
      invoice: 'Безналичный',
      cash: 'Наличные',
      pickup: 'При самовывозе',
    };
    return labels[method] || method;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Заказы</h1>
        <p className="text-muted-foreground">
          Управление заказами и их статусами
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру, имени, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Статус заказа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="confirmed">Подтвержден</SelectItem>
                <SelectItem value="shipped">Отправлен</SelectItem>
                <SelectItem value="delivered">Доставлен</SelectItem>
                <SelectItem value="cancelled">Отменен</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Статус оплаты" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает оплаты</SelectItem>
                <SelectItem value="paid">Оплачен</SelectItem>
                <SelectItem value="failed">Ошибка</SelectItem>
                <SelectItem value="refunded">Возврат</SelectItem>
              </SelectContent>
            </Select>

            <Select value={orderTypeFilter} onValueChange={(v) => setOrderTypeFilter(v as 'all' | 'dealer' | 'retail')}>
              <SelectTrigger>
                <SelectValue placeholder="Тип заказа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="dealer">Только дилерские</SelectItem>
                <SelectItem value="retail">Только розничные</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Всего: {filteredOrders.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер заказа</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Способ оплаты</TableHead>
                <TableHead>Статус заказа</TableHead>
                <TableHead>Статус оплаты</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Заказов не найдено
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const PaymentIcon = paymentMethodIcons[order.paymentMethod as keyof typeof paymentMethodIcons] || Package;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{order.orderNumber}</span>
                          {order.orderType === 'dealer' && (
                            <Badge className="bg-indigo-100 text-indigo-800">Дилер</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.firstName} {order.lastName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getDeliveryMethodLabel(order)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{order.email}</p>
                          <p className="text-muted-foreground">{order.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PaymentIcon className="h-4 w-4" />
                          <span className="text-sm">{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}>
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(order.total).toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}



