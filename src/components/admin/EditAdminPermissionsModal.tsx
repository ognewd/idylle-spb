'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface Admin {
  id: string;
  name: string;
  email: string;
  allowedAdminSections?: string[];
}

interface EditAdminPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
  onSuccess: () => void;
}

const adminSections = [
  { value: 'products', label: 'Товары' },
  { value: 'categories', label: 'Категории' },
  { value: 'seasonal-discounts', label: 'Сезонные скидки' },
  { value: 'filters', label: 'Фильтры' },
  { value: 'users', label: 'Покупатели' },
  { value: 'orders', label: 'Заказы' },
  { value: 'administrators', label: 'Администраторы' },
];

export function EditAdminPermissionsModal({ 
  isOpen, 
  onClose, 
  admin, 
  onSuccess 
}: EditAdminPermissionsModalProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Инициализация при открытии модального окна
  React.useEffect(() => {
    if (admin && isOpen) {
      setSelectedSections(admin.allowedAdminSections || []);
      setError('');
    }
  }, [admin, isOpen]);

  const handleSectionToggle = (sectionValue: string, checked: boolean) => {
    if (checked) {
      setSelectedSections(prev => [...prev, sectionValue]);
    } else {
      setSelectedSections(prev => prev.filter(s => s !== sectionValue));
    }
  };

  const handleSelectAll = () => {
    if (selectedSections.length === adminSections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(adminSections.map(s => s.value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allowedAdminSections: selectedSections,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Ошибка при обновлении прав доступа');
      }
    } catch (err) {
      setError('Ошибка при обновлении прав доступа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSections([]);
    setError('');
    onClose();
  };

  if (!isOpen || !admin) return null;

  const isAllSelected = selectedSections.length === adminSections.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Редактировать права доступа</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Администратор: <strong>{admin.name}</strong> ({admin.email})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Разделы админки</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {isAllSelected ? 'Снять все' : 'Выбрать все'}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {adminSections.map((section) => (
                <div key={section.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.value}
                    checked={selectedSections.includes(section.value)}
                    onCheckedChange={(checked) => 
                      handleSectionToggle(section.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={section.value} className="text-sm font-normal">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
