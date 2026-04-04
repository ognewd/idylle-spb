'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, ArrowLeft, Users, Building2, Trash2 } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  brands: { brand: { id: string; name: string } }[];
  _count: { users: number };
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/partners', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners);
      } else {
        setError(data.error || 'Ошибка загрузки');
      }
    } catch {
      setError('Ошибка загрузки партнёров');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить партнёра "${name}"? Все пользователи партнёра будут деактивированы.`)) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        fetchPartners();
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch {
      alert('Ошибка удаления');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка партнёров...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Партнёры</h1>
              <p className="text-muted-foreground">Управление партнёрами и их брендами</p>
            </div>
          </div>
          <Button onClick={() => router.push('/admin/partners/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Создать партнёра
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        {partners.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Партнёров пока нет</p>
              <p className="text-sm text-muted-foreground mb-4">Создайте первого партнёра для начала работы</p>
              <Button onClick={() => router.push('/admin/partners/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Создать партнёра
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {partners.map((partner) => (
              <Card
                key={partner.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/partners/${partner.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <Badge variant={partner.isActive ? 'default' : 'secondary'}>
                        {partner.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(partner.id, partner.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Контактное лицо:</span>{' '}
                      <span className="font-medium">{partner.contactPerson}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      <span className="font-medium">{partner.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Пользователей:</span>{' '}
                      <span className="font-medium">{partner._count.users}</span>
                    </div>
                  </div>
                  {partner.brands.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {partner.brands.map((pb) => (
                        <Badge key={pb.brand.id} variant="outline">
                          {pb.brand.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
