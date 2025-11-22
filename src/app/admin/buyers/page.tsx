'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Users, Search, Mail, Phone, MapPin, Calendar, CreditCard, Trash2, UserX, Lock } from 'lucide-react';

interface Buyer {
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  firstOrderDate: string;
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
  isRegistered: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BuyersManagementPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchBuyers = async (page = 1, search = '', filterType = 'all') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        filter: filterType,
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/buyers?${params}`);
      const result = await response.json();

      if (result.success) {
        setBuyers(result.buyers);
        setPagination(result.pagination);
        setError('');
      } else {
        setError(result.error || 'Ошибка при загрузке покупателей');
      }
    } catch (err) {
      setError('Ошибка при загрузке покупателей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers(1, searchTerm, filter);
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBuyers(1, searchTerm, filter);
  };

  const handlePageChange = (newPage: number) => {
    fetchBuyers(newPage, searchTerm, filter);
  };

  const handleResetPassword = async (userId: string | null) => {
    if (!userId) return;

    if (!confirm('Вы уверены, что хотите сбросить пароль этого пользователя?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/buyers/${userId}/reset-password`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        alert(`Пароль успешно сброшен! Новый пароль: ${result.newPassword}\n\nПожалуйста, скопируйте и передайте его пользователю.`);
      } else {
        alert(result.error || 'Ошибка при сбросе пароля');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Ошибка при сбросе пароля');
    }
  };

  const handleDeactivate = async (userId: string | null) => {
    if (!userId) return;

    if (!confirm('Вы уверены, что хотите деактивировать этого пользователя?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/buyers/${userId}/deactivate`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || 'Пользователь деактивирован');
        fetchBuyers(pagination.page, searchTerm, filter);
      } else {
        alert(result.error || 'Ошибка при деактивации');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Ошибка при деактивации пользователя');
    }
  };

  const handleDelete = async (userId: string | null) => {
    if (!userId) return;

    if (!confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/buyers/${userId}/delete`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || 'Пользователь удален');
        fetchBuyers(pagination.page, searchTerm, filter);
      } else {
        alert(result.error || 'Ошибка при удалении');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка при удалении пользователя');
    }
  };

  const handleDeleteGuest = async (email: string) => {
    if (!confirm('Вы уверены, что хотите удалить все заказы этого гостя? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/buyers/guest', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || 'Заказы гостя удалены');
        fetchBuyers(pagination.page, searchTerm, filter);
      } else {
        alert(result.error || 'Ошибка при удалении');
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Ошибка при удалении заказов гостя');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка покупателей...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Покупатели</h1>
            <p className="text-muted-foreground">
              Управление информацией о покупателях
            </p>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск по имени, email или телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Поиск</Button>
          </form>

          {/* Фильтры */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Все
            </Button>
            <Button
              variant={filter === 'registered' ? 'default' : 'outline'}
              onClick={() => setFilter('registered')}
            >
              Зарегистрированные
            </Button>
            <Button
              variant={filter === 'unregistered' ? 'default' : 'outline'}
              onClick={() => setFilter('unregistered')}
            >
              Незарегистрированные
            </Button>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Таблица покупателей */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Покупатель</TableHead>
                <TableHead>Контактная информация</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Заказы</TableHead>
                <TableHead>Потрачено</TableHead>
                <TableHead>Последний заказ</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Покупатели не найдены
                  </TableCell>
                </TableRow>
              ) : (
                buyers.map((buyer, index) => (
                  <TableRow key={`${buyer.email}-${index}`}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {buyer.firstName} {buyer.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {buyer.email}
                        </div>
                        <div className="mt-1">
                          {buyer.isRegistered ? (
                            <Badge variant="default" className="bg-green-500">Зарегистрирован</Badge>
                          ) : (
                            <Badge variant="secondary">Гость</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {buyer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {buyer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {buyer.city ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3" />
                          {buyer.city}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Не указан</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {buyer.totalOrders} заказ{buyer.totalOrders > 1 ? 'ов' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(buyer.totalSpent)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(buyer.lastOrderDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {buyer.isRegistered && buyer.userId ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetPassword(buyer.userId)}
                              title="Сбросить пароль"
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(buyer.userId)}
                              title="Деактивировать пользователя"
                            >
                              <UserX className="h-4 w-4 text-orange-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(buyer.userId)}
                              title="Удалить пользователя"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteGuest(buyer.email)}
                            title="Удалить заказы гостя"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Пагинация */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Показано {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total} покупателей
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Предыдущая
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Следующая
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
