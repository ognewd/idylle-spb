'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { generateRandomPassword } from '@/lib/password-generator';
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function AddAdminModal({ isOpen, onClose, onSuccess }: AddAdminModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    allowedAdminSections: adminSections.map(section => section.value), // Все разделы активны по умолчанию
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword(12);
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      // Можно добавить toast уведомление
    } catch (err) {
      console.error('Ошибка при копировании пароля:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        setFormData({ name: '', email: '', password: '', allowedAdminSections: adminSections.map(section => section.value) });
      } else {
        setError(result.error || 'Ошибка при создании администратора');
      }
    } catch (err) {
      setError('Ошибка при создании администратора');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', allowedAdminSections: adminSections.map(section => section.value) });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Добавить администратора</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Введите имя администратора"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="Введите email"
            />
          </div>

          <div>
            <Label htmlFor="password">Пароль</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="Введите пароль"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                title="Сгенерировать пароль"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {formData.password && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyPassword}
                  title="Скопировать пароль"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label>Разделы админки</Label>
            <div className="space-y-2 mt-2">
              {adminSections.map((section) => (
                <div key={section.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.value}
                    checked={formData.allowedAdminSections.includes(section.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData(prev => ({
                          ...prev,
                          allowedAdminSections: [...prev.allowedAdminSections, section.value]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          allowedAdminSections: prev.allowedAdminSections.filter(s => s !== section.value)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={section.value} className="text-sm font-normal">
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Выберите разделы, к которым будет иметь доступ администратор
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Создание...' : 'Создать администратора'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
