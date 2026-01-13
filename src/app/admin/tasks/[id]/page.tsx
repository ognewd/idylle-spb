'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, FileText, Download, Calendar, User, CheckCircle2, Clock, Circle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'new' | 'in_progress' | 'done';
  priority: 'urgent' | 'normal' | 'someday';
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  messages: TaskMessage[];
}

interface TaskMessage {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

const statusLabels = {
  new: 'Новая',
  in_progress: 'В процессе',
  done: 'Готово',
};

const statusColors = {
  new: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
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

export default function TaskDetailPage() {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'new' | 'in_progress' | 'done'>('new');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadTask();
    
    // Обновляем задачу каждые 5 секунд для получения новых сообщений
    const interval = setInterval(() => {
      loadTask();
    }, 5000);

    return () => clearInterval(interval);
  }, [router, taskId]);

  useEffect(() => {
    scrollToBottom();
  }, [task?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTask = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        console.error('No admin token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTask(data);
        setStatus(data.status);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to load task:', errorData);
        if (response.status === 404) {
          alert('Задача не найдена');
          router.push('/admin/tasks');
        } else {
          alert(`Ошибка загрузки задачи: ${errorData.error || 'Неизвестная ошибка'}`);
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
      alert('Ошибка при загрузке задачи. Проверьте консоль браузера.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Вы не авторизованы.');
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/tasks/${taskId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (response.ok) {
        setMessage('');
        await loadTask();
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения.');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: 'new' | 'in_progress' | 'done') => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Вы не авторизованы.');
        return;
      }

      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        await loadTask();
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса.');
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка задачи...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Задача не найдена</p>
          <Button onClick={() => router.push('/admin/tasks')} className="mt-4">
            Вернуться к списку задач
          </Button>
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
                onClick={() => router.push('/admin/tasks')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={statusColors[task.status]}>
                    {statusLabels[task.status]}
                  </Badge>
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {priorityLabels[task.priority]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Описание задачи */}
            <Card>
              <CardHeader>
                <CardTitle>Описание задачи</CardTitle>
              </CardHeader>
              <CardContent>
                {task.description ? (
                  <p className="whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-muted-foreground">Описание отсутствует</p>
                )}
                {task.fileUrl && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{task.fileName}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(task.fileUrl!, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Чат */}
            <Card>
              <CardHeader>
                <CardTitle>Обсуждение задачи</CardTitle>
                <CardDescription>
                  {task.messages.length} {task.messages.length === 1 ? 'сообщение' : 'сообщений'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {task.messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Пока нет сообщений. Начните обсуждение!
                    </p>
                  ) : (
                    task.messages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {msg.user.name || msg.user.email}
                          </span>
                          <span className="text-muted-foreground">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <div className="bg-muted rounded-lg p-3 ml-6">
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <Separator className="my-4" />

                <form onSubmit={handleSendMessage} className="space-y-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Напишите сообщение..."
                    rows={3}
                    disabled={isSending}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSending || !message.trim()}>
                      {isSending ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Отправить
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Информация о задаче */}
            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Создал</Label>
                  <p className="font-medium">
                    {task.createdBy.name || task.createdBy.email}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Дата создания</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(task.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Последнее обновление</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(task.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Управление статусом */}
            <Card>
              <CardHeader>
                <CardTitle>Управление</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Статус</Label>
                  <Select value={status} onValueChange={(value: any) => handleStatusChange(value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <div className="flex items-center gap-2">
                          <Circle className="h-4 w-4 text-blue-500" />
                          Новая
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          В процессе
                        </div>
                      </SelectItem>
                      <SelectItem value="done">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Готово
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

