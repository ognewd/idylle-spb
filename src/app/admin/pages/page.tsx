'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  FileText,
  Eye,
  EyeOff,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { generateSlug } from '@/lib/transliterate';
import { CategoryContentEditor } from '@/components/admin/CategoryContentEditor';
import { Checkbox } from '@/components/ui/checkbox';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    loadPages();
  }, [router]);

  const loadPages = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/admin/pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to load pages:', errorData);
        alert(`Ошибка загрузки страниц: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      alert('Ошибка при загрузке страниц. Проверьте консоль браузера.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content || '',
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        isActive: page.isActive,
        sortOrder: page.sortOrder,
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true,
        sortOrder: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isActive: true,
      sortOrder: 0,
    });
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPage ? formData.slug : generateSlug(title),
    });
  };

  // Функция для очистки HTML от лишних пробелов
  const cleanHtml = (html: string): string => {
    if (!html) return '';
    
    return html
      .replace(/<\/p>\s*<br\s*\/?>\s*<p>/gi, '</p><p>')
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
      .replace(/(<br\s*\/?>)\s*(<br\s*\/?>)+/gi, '<br>')
      .replace(/<p>\s*<\/p>/gi, '')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      const url = editingPage
        ? `/api/admin/pages/${editingPage.id}`
        : '/api/admin/pages';
      
      const method = editingPage ? 'PUT' : 'POST';

      // Очищаем content от лишних пробелов перед отправкой
      const cleanedData = {
        ...formData,
        content: formData.content ? cleanHtml(formData.content) : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (response.ok) {
        await loadPages();
        handleCloseModal();
      } else {
        const error = await response.json();
        console.error('Save error:', error);
        alert(error.details || error.error || 'Ошибка при сохранении страницы');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Ошибка при сохранении страницы');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту страницу?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadPages();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при удалении страницы');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Ошибка при удалении страницы');
    }
  };

  const toggleStatus = async (page: Page) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...page,
          isActive: !page.isActive,
        }),
      });

      if (response.ok) {
        await loadPages();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при изменении статуса');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Ошибка при изменении статуса');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">Управление страницами</h1>
          <p className="text-muted-foreground mt-2">
            Создавайте и редактируйте внутренние страницы сайта
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Создать страницу
        </Button>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Страницы не найдены</h3>
            <p className="text-muted-foreground mb-6">Создайте первую страницу, чтобы начать работу</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Создать страницу
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{page.title}</CardTitle>
                    <CardDescription className="text-sm">/{page.slug}</CardDescription>
                  </div>
                  <Badge variant={page.isActive ? 'default' : 'secondary'}>
                    {page.isActive ? (
                      <Eye className="h-3 w-3 mr-1" />
                    ) : (
                      <EyeOff className="h-3 w-3 mr-1" />
                    )}
                    {page.isActive ? 'Активна' : 'Неактивна'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {page.metaDescription || page.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'Нет описания'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(page)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(page)}
                  >
                    {page.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal для создания/редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {editingPage ? 'Редактировать страницу' : 'Новая страница'}
                  </CardTitle>
                  <CardDescription>
                    {editingPage 
                      ? 'Изменить информацию о странице'
                      : 'Создать новую страницу сайта'}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок страницы *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Например: О нас"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL (slug) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                placeholder="about"
                required
              />
              <p className="text-xs text-muted-foreground">
                Страница будет доступна по адресу: /{formData.slug || 'slug'}
              </p>
            </div>

            <div className="space-y-2">
              <CategoryContentEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                label="Контент страницы"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Заголовок для поисковых систем"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Описание для поисковых систем"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Страница активна
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Порядок сортировки</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {editingPage ? 'Сохранить' : 'Создать'}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseModal} disabled={saving}>
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

