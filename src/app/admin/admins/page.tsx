'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AddAdminModal } from '@/components/admin/AddAdminModal';
import { AdminsTable } from '@/components/admin/AdminsTable';
import { Users, Plus } from 'lucide-react';

interface Admin {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  allowedAdminSections?: string[];
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/admins');
      const result = await response.json();

      if (result.success) {
        setAdmins(result.admins);
        setError('');
      } else {
        setError(result.error || 'Ошибка при загрузке администраторов');
      }
    } catch (err) {
      setError('Ошибка при загрузке администраторов');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddSuccess = () => {
    fetchAdmins();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка администраторов...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Управление администраторами</h1>
              <p className="text-muted-foreground">
                Создание, редактирование и управление правами администраторов
              </p>
            </div>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить администратора
          </Button>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Таблица администраторов */}
        <AdminsTable admins={admins} onUpdateAdmin={fetchAdmins} />

        {/* Модальное окно добавления */}
        <AddAdminModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      </div>
    </div>
  );
}
