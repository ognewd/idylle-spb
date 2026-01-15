'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Copy, 
  Archive, 
  Eye,
  MoreVertical,
  Mail,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailTemplate {
  id: string;
  name: string;
  subjectDefault: string | null;
  status: string;
  updatedAt: string;
  createdAt: string;
}

export default function MarketingTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, [statusFilter]);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/admin/email/marketing/templates'
        : `/api/admin/email/marketing/templates?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to load templates');
      
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/email/marketing/templates/${templateId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to load template');
      
      const template = await response.json();
      
      const newTemplate = await fetch('/api/admin/email/marketing/templates', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: `${template.name} (копия)`,
          subjectDefault: template.subjectDefault,
          designJson: template.designJson,
          status: 'draft',
        }),
      });

      if (newTemplate.ok) {
        loadTemplates();
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleArchive = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/email/marketing/templates/${templateId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'archived' }),
      });

      if (response.ok) {
        loadTemplates();
      }
    } catch (error) {
      console.error('Error archiving template:', error);
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить шаблон "${templateName}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/email/marketing/templates/${templateId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadTemplates();
      } else {
        const errorData = await response.json();
        alert(`Ошибка при удалении: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Ошибка при удалении шаблона');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: 'default' | 'secondary' | 'outline'; label: string } } = {
      draft: { variant: 'outline', label: 'Черновик' },
      active: { variant: 'default', label: 'Активен' },
      archived: { variant: 'secondary', label: 'Архив' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin/email/marketing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к маркетинговым email
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Шаблоны писем</h1>
            <p className="text-muted-foreground">
              Создавайте и редактируйте шаблоны маркетинговых писем
            </p>
          </div>
          <Button onClick={() => router.push('/admin/email/marketing/templates/new/edit')}>
            <Plus className="h-4 w-4 mr-2" />
            Создать шаблон
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
        >
          Все
        </Button>
        <Button
          variant={statusFilter === 'draft' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('draft')}
        >
          Черновики
        </Button>
        <Button
          variant={statusFilter === 'active' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('active')}
        >
          Активные
        </Button>
        <Button
          variant={statusFilter === 'archived' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('archived')}
        >
          Архив
        </Button>
      </div>

      {/* Список шаблонов */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Нет шаблонов</h3>
            <p className="text-muted-foreground mb-4">
              Создайте первый шаблон, чтобы начать работу
            </p>
            <Button onClick={() => router.push('/admin/email/marketing/templates/new/edit')}>
              <Plus className="h-4 w-4 mr-2" />
              Создать шаблон
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(template.status)}
                    </div>
                    {template.subjectDefault && (
                      <CardDescription className="text-xs mt-2">
                        Тема: {template.subjectDefault}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/email/marketing/templates/${template.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/email/marketing/templates/${template.id}/preview`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Предпросмотр
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Дублировать
                      </DropdownMenuItem>
                      {template.status !== 'archived' && (
                        <DropdownMenuItem onClick={() => handleArchive(template.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Архивировать
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(template.id, template.name)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Обновлен: {new Date(template.updatedAt).toLocaleDateString('ru-RU')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
