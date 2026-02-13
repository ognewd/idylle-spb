'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle, Calendar, FileText, User, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'new' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'normal' | 'someday';
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  files: TaskFile[];
  _count: {
    messages: number;
  };
}

const statusLabels = {
  new: 'Новая',
  in_progress: 'В процессе',
  review: 'На проверке',
  done: 'Готово',
};

const statusColors = {
  new: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  review: 'bg-purple-500',
  done: 'bg-green-500',
};

const priorityLabels = {
  urgent: 'Срочно',
  normal: 'Нормально',
  someday: 'Когда-нибудь',
};

const priorityColors = {
  urgent: 'bg-red-500',
  normal: 'bg-blue-500',
  someday: 'bg-gray-500',
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as 'urgent' | 'normal' | 'someday',
    files: [] as File[],
    assignedToEmail: 'ognewd@gmail.com',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadTasks();
  }, [router]);

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to load tasks:', errorData);
        alert(`Ошибка загрузки задач: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Ошибка при загрузке задач. Проверьте консоль браузера.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'normal',
      files: [],
      assignedToEmail: 'ognewd@gmail.com',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      priority: 'normal',
      files: [],
      assignedToEmail: 'ognewd@gmail.com',
    });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFormData({ ...formData, files: [...formData.files, ...newFiles] });
      // Сбрасываем input для возможности повторной загрузки
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFormData({
      ...formData,
      files: formData.files.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Вы не авторизованы.');
        router.push('/admin/login');
        return;
      }

      // Загружаем все файлы
      const fileUrls: Array<{ url: string; fileName: string; fileType: string; fileSize: number }> = [];
      
      for (const file of formData.files) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrls.push({
            url: uploadData.url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          });
        } else {
          alert(`Ошибка при загрузке файла: ${file.name}`);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
          assignedToEmail: formData.assignedToEmail || 'ognewd@gmail.com',
        }),
      });

      if (response.ok) {
        await loadTasks();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Ошибка при создании задачи.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка задач...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Задачи по сайту</h1>
                <p className="text-gray-600">Всего задач: {tasks.length}</p>
              </div>
            </div>
            <Button onClick={handleOpenModal}>
              <Plus className="h-4 w-4 mr-2" />
              Создать задачу
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tasks.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Задач пока нет</h3>
            <p className="text-gray-600 mb-6">Создайте первую задачу, чтобы начать работу</p>
            <Button onClick={handleOpenModal}>
              <Plus className="h-4 w-4 mr-2" />
              Создать задачу
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/tasks/${task.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {task.status === 'done' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : task.status === 'in_progress' ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : task.status === 'review' ? (
                          <AlertCircle className="h-5 w-5 text-purple-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-blue-500" />
                        )}
                        {task.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {task.description && (
                          <p className="line-clamp-2">{task.description}</p>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusColors[task.status]}>
                        {statusLabels[task.status]}
                      </Badge>
                      <Badge variant="outline" className={priorityColors[task.priority]}>
                        {priorityLabels[task.priority]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(task.createdAt)}</span>
                      </div>
                      <div>
                        Создал: {task.createdBy.name || task.createdBy.email}
                      </div>
                      {task.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Назначено: {task.assignedTo.name || task.assignedTo.email}</span>
                        </div>
                      )}
                      {task.files && task.files.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{task.files.length} {task.files.length === 1 ? 'файл' : 'файлов'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task._count.messages > 0 && (
                        <span className="text-xs">
                          {task._count.messages} {task._count.messages === 1 ? 'сообщение' : 'сообщений'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создать задачу</DialogTitle>
            <DialogDescription>
              Заполните информацию о новой задаче
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название задачи *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Например: Обновить дизайн главной страницы"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Подробное описание задачи..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'urgent' | 'normal' | 'someday') => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Срочно</SelectItem>
                  <SelectItem value="normal">Нормально</SelectItem>
                  <SelectItem value="someday">Когда-нибудь</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Назначить на</Label>
              <Input
                id="assignedTo"
                type="email"
                value={formData.assignedToEmail}
                onChange={(e) => setFormData({ ...formData, assignedToEmail: e.target.value })}
                placeholder="ognewd@gmail.com"
              />
              <p className="text-xs text-muted-foreground">
                Email пользователя, на которого назначается задача (по умолчанию: ognewd@gmail.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Приложить файлы (опционально)</Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={handleFilesChange}
                accept=".doc,.docx,.xls,.xlsx,.pdf,image/*"
              />
              <p className="text-xs text-muted-foreground">
                Можно выбрать несколько файлов: Word (.doc, .docx), Excel (.xls, .xlsx), PDF, изображения
              </p>
              {formData.files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} КБ)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                Создать задачу
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

