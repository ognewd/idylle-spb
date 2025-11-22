'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CheckCircle, XCircle, UserX, UserCheck, Trash2, Settings } from 'lucide-react';
import { EditAdminPermissionsModal } from './EditAdminPermissionsModal';

interface Admin {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  allowedAdminSections?: string[];
}

interface AdminsTableProps {
  admins: Admin[];
  onUpdateAdmin: () => void;
}

const adminSectionLabels: { [key: string]: string } = {
  products: 'Товары',
  categories: 'Категории',
  'seasonal-discounts': 'Сезонные скидки',
  filters: 'Фильтры',
  users: 'Покупатели',
  orders: 'Заказы',
  administrators: 'Администраторы',
};

export function AdminsTable({ admins, onUpdateAdmin }: AdminsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [deleteStates, setDeleteStates] = useState<{ [key: string]: boolean }>({});
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredAdmins = admins.filter(admin => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return admin.isActive;
    if (statusFilter === 'inactive') return !admin.isActive;
    return true;
  });

  const handleToggleStatus = async (adminId: string, currentStatus: boolean) => {
    setLoadingStates(prev => ({ ...prev, [adminId]: true }));
    
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        onUpdateAdmin();
      } else {
        console.error('Ошибка при обновлении статуса:', result.error);
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [adminId]: false }));
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить администратора "${adminName}"? Это действие нельзя отменить.`)) {
      return;
    }

    setDeleteStates(prev => ({ ...prev, [adminId]: true }));
    
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        onUpdateAdmin();
        alert('Администратор успешно удален');
      } else {
        alert(`Ошибка при удалении: ${result.error}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении администратора:', error);
      alert('Ошибка при удалении администратора');
    } finally {
      setDeleteStates(prev => ({ ...prev, [adminId]: false }));
    }
  };

  const handleEditPermissions = (admin: Admin) => {
    setEditingAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    onUpdateAdmin();
    setIsEditModalOpen(false);
    setEditingAdmin(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Статус:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="inactive">Неактивен</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Таблица */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Раздел админки</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Администраторы не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    {admin.allowedAdminSections && admin.allowedAdminSections.length > 0 ? (
                      admin.allowedAdminSections.length === 7 ? (
                        <Badge variant="default" className="bg-green-600">
                          Полный доступ
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {admin.allowedAdminSections.map((section) => (
                            <Badge key={section} variant="outline" className="text-xs">
                              {adminSectionLabels[section] || section}
                            </Badge>
                          ))}
                        </div>
                      )
                    ) : (
                      <Badge variant="secondary">Нет доступа</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(admin.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.isActive ? 'default' : 'secondary'}>
                      {admin.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Активен
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Неактивен
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPermissions(admin)}
                        disabled={loadingStates[admin.id] || deleteStates[admin.id]}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Права
                      </Button>
                      <Button
                        variant={admin.isActive ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleToggleStatus(admin.id, admin.isActive)}
                        disabled={loadingStates[admin.id] || deleteStates[admin.id]}
                      >
                        {loadingStates[admin.id] ? (
                          'Обновление...'
                        ) : admin.isActive ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Деактивировать
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Активировать
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                        disabled={loadingStates[admin.id] || deleteStates[admin.id]}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleteStates[admin.id] ? (
                          'Удаление...'
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Удалить
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Статистика */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>Всего: {admins.length}</span>
        <span>Активных: {admins.filter(a => a.isActive).length}</span>
        <span>Неактивных: {admins.filter(a => !a.isActive).length}</span>
      </div>

      {/* Модальное окно редактирования прав */}
      <EditAdminPermissionsModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAdmin(null);
        }}
        admin={editingAdmin}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
