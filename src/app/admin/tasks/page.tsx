'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle, Calendar, FileText, User, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskDetailPanel } from '@/components/admin/TaskDetailPanel';

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

type TaskStatusKey = 'new' | 'in_progress' | 'review' | 'done';

type BoardData = Record<TaskStatusKey, { tasks: Task[]; total: number }>;

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

const TASKS_PAGE_SIZE = 20;
const BOARD_LIMIT_PER_COLUMN = 10;

const BOARD_ORDER: TaskStatusKey[] = ['new', 'in_progress', 'review', 'done'];

const EMPTY_BOARD = (): BoardData => ({
  new: { tasks: [], total: 0 },
  in_progress: { tasks: [], total: 0 },
  review: { tasks: [], total: 0 },
  done: { tasks: [], total: 0 },
});

const COLUMN_RING: Record<TaskStatusKey, string> = {
  new: 'border-t-blue-500',
  in_progress: 'border-t-yellow-500',
  review: 'border-t-purple-500',
  done: 'border-t-green-500',
};

type StatusFilter = 'all' | 'new' | 'in_progress' | 'review' | 'done';

interface AssigneeOption {
  id: string;
  name: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: TASKS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as 'urgent' | 'normal' | 'someday',
    files: [] as File[],
    assignedToEmail: 'ognewd@gmail.com',
  });
  const router = useRouter();

  const loadTasks = useCallback(
    async (page: number, append: boolean = false) => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsLoading(false);
        setLoadingMore(false);
        return;
      }
      if (page === 1) setIsLoading(true);
      else setLoadingMore(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(TASKS_PAGE_SIZE));
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (selectedAssigneeIds.length > 0) params.set('assigneeIds', selectedAssigneeIds.join(','));

        const response = await fetch(`/api/admin/tasks?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          alert(`Ошибка загрузки задач: ${errorData.error || 'Неизвестная ошибка'}`);
          return;
        }

        const data = await response.json();
        const list = data.tasks || [];
        if (append) {
          setTasks((prev) => [...prev, ...list]);
        } else {
          setTasks(list);
        }
        if (data.pagination) setPagination(data.pagination);
        if (data.assignees && page === 1) setAssignees(data.assignees);
      } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Ошибка при загрузке задач.');
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, selectedAssigneeIds]
  );

  const loadBoard = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setBoardLoading(false);
      return;
    }
    setBoardLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('board', '1');
      params.set('limitPerColumn', String(BOARD_LIMIT_PER_COLUMN));
      if (selectedAssigneeIds.length > 0) params.set('assigneeIds', selectedAssigneeIds.join(','));

      const response = await fetch(`/api/admin/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Ошибка загрузки доски: ${errorData.error || 'Неизвестная ошибка'}`);
        setBoard(EMPTY_BOARD());
        return;
      }
      const data = await response.json();
      if (data.board) setBoard(data.board as BoardData);
      if (data.assignees) setAssignees(data.assignees);
    } catch (e) {
      console.error(e);
      alert('Ошибка при загрузке доски задач.');
      setBoard(EMPTY_BOARD());
    } finally {
      setBoardLoading(false);
    }
  }, [selectedAssigneeIds]);

  const refreshAfterTaskDetail = useCallback(() => {
    if (statusFilter === 'all') void loadBoard();
    else void loadTasks(1);
  }, [statusFilter, loadBoard, loadTasks]);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      router.push('/admin/login');
      return;
    }
    if (statusFilter === 'all') {
      void loadBoard();
    } else {
      void loadTasks(1);
    }
  }, [statusFilter, selectedAssigneeIds, loadBoard, loadTasks, router]);

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
        if (statusFilter === 'all') await loadBoard();
        else await loadTasks(1);
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

  const loadMore = useCallback(() => {
    if (loadingMore || pagination.page >= pagination.totalPages) return;
    loadTasks(pagination.page + 1, true);
  }, [loadingMore, pagination.page, pagination.totalPages, loadTasks]);

  useEffect(() => {
    if (statusFilter === 'all') return;
    if (pagination.totalPages === 0 || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && pagination.page < pagination.totalPages) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    const t = setTimeout(() => {
      const sentinel = document.getElementById('tasks-scroll-sentinel');
      if (sentinel) observer.observe(sentinel);
    }, 100);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [statusFilter, pagination.page, pagination.totalPages, isLoading, loadingMore, loadMore]);

  const toggleAssignee = (id: string) => {
    setSelectedAssigneeIds((prev) => {
      if (prev.length === 0) {
        return assignees.filter((a) => a.id !== id).map((a) => a.id);
      }
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        return next.length === 0 ? [] : next;
      }
      return [...prev, id];
    });
  };

  const isAssigneeChecked = (id: string) =>
    selectedAssigneeIds.length === 0 ? true : selectedAssigneeIds.includes(id);

  const isAllAssigneesChecked = selectedAssigneeIds.length === 0;

  const setAllAssigneesChecked = (checked: boolean) => {
    setSelectedAssigneeIds(checked ? [] : assignees.map((a) => a.id));
  };

  const boardTotalAll =
    board == null ? null : BOARD_ORDER.reduce((sum, key) => sum + board[key].total, 0);

  const showInitialLoader =
    (statusFilter === 'all' && boardLoading && board === null) ||
    (statusFilter !== 'all' && isLoading && tasks.length === 0);

  if (showInitialLoader) {
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
                <p className="text-gray-600">
                  {statusFilter === 'all' && boardTotalAll != null
                    ? `Всего задач: ${boardTotalAll}`
                    : pagination.totalPages <= 1 && tasks.length === pagination.total
                      ? `Всего задач: ${pagination.total}`
                      : `Показано: ${tasks.length} из ${pagination.total}`}
                </p>
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
        {/* Фильтры показываем всегда после загрузки — чтобы при пустом результате по фильтру можно было сменить статус/исполнителя */}
        {(statusFilter === 'all' || !isLoading) && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Статус:</span>
              {(
                [
                  { value: 'all' as const, label: 'Все' },
                  { value: 'new' as const, label: statusLabels.new },
                  { value: 'in_progress' as const, label: statusLabels.in_progress },
                  { value: 'review' as const, label: statusLabels.review },
                  { value: 'done' as const, label: statusLabels.done },
                ] as const
              ).map(({ value, label }) => (
                <Button
                  key={value}
                  variant={statusFilter === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            {assignees.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-sm font-medium text-gray-700">Исполнитель:</span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="assignee-all"
                    checked={isAllAssigneesChecked}
                    onCheckedChange={(v) => setAllAssigneesChecked(!!v)}
                  />
                  <label htmlFor="assignee-all" className="text-sm cursor-pointer select-none">
                    Все
                  </label>
                </div>
                {assignees.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`assignee-${a.id}`}
                      checked={isAssigneeChecked(a.id)}
                      onCheckedChange={() => toggleAssignee(a.id)}
                    />
                    <label
                      htmlFor={`assignee-${a.id}`}
                      className="text-sm cursor-pointer select-none"
                    >
                      {a.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {statusFilter === 'all' && board != null ? (
          boardTotalAll === 0 && !boardLoading ? (
            selectedAssigneeIds.length === 0 ? (
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
              <div className="text-center py-12 text-gray-600">
                <p className="text-lg">По выбранным фильтрам задач не найдено.</p>
                <p className="text-sm mt-2">Смените исполнителя выше или создайте новую задачу.</p>
                <Button onClick={handleOpenModal} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать задачу
                </Button>
              </div>
            )
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 ${boardLoading ? 'opacity-70 pointer-events-none' : ''}`}
            >
              {BOARD_ORDER.map((st) => {
                const col = board[st];
                const showSeeAll = col.total > col.tasks.length;
                return (
                  <div
                    key={st}
                    className={`rounded-lg border bg-white shadow-sm border-t-4 ${COLUMN_RING[st]} flex flex-col max-h-[min(70vh,52rem)]`}
                  >
                    <div className="p-3 border-b bg-gray-50/80 shrink-0">
                      <h2 className="font-semibold text-gray-900">{statusLabels[st]}</h2>
                      <p className="text-sm text-muted-foreground">Всего в статусе: {col.total}</p>
                    </div>
                    <div className="p-2 flex-1 overflow-y-auto space-y-2 min-h-0">
                      {col.tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-2 py-4 text-center">Нет задач</p>
                      ) : (
                        col.tasks.map((task) => (
                          <Card
                            key={task.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setDetailTaskId(task.id)}
                          >
                            <CardHeader className="p-3 pb-2">
                              <CardTitle className="text-sm font-medium leading-snug line-clamp-3 flex items-start gap-2">
                                {task.status === 'done' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                ) : task.status === 'in_progress' ? (
                                  <Clock className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                                ) : task.status === 'review' ? (
                                  <AlertCircle className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                )}
                                <span>{task.title}</span>
                              </CardTitle>
                              {task.description ? (
                                <CardDescription className="text-xs line-clamp-2 mt-1">
                                  {task.description}
                                </CardDescription>
                              ) : null}
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="flex flex-wrap items-center gap-1">
                                <Badge variant="outline" className={`text-[10px] px-1.5 ${priorityColors[task.priority]}`}>
                                  {priorityLabels[task.priority]}
                                </Badge>
                                {task.assignedTo ? (
                                  <span className="text-[10px] text-blue-600 truncate max-w-[10rem]">
                                    {task.assignedTo.name || task.assignedTo.email}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">Не назначено</span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                    {showSeeAll ? (
                      <div className="p-2 border-t shrink-0 bg-white">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setStatusFilter(st)}>
                          Все задачи этого статуса ({col.total})
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )
        ) : tasks.length === 0 && !isLoading ? (
          pagination.total === 0 && selectedAssigneeIds.length === 0 ? (
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
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg">По выбранным фильтрам задач не найдено.</p>
              <p className="text-sm mt-2">Смените статус или исполнителя выше или создайте новую задачу.</p>
              <Button onClick={handleOpenModal} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Создать задачу
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setDetailTaskId(task.id)}
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
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Создал: {task.createdBy.name || task.createdBy.email}</span>
                      </div>
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <User className="h-4 w-4" />
                          <span>Назначено: {task.assignedTo.name || task.assignedTo.email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400 italic">
                          <User className="h-4 w-4" />
                          <span>Не назначено</span>
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
            <div id="tasks-scroll-sentinel" className="h-4" aria-hidden />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={detailTaskId != null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailTaskId(null);
            refreshAfterTaskDetail();
          }
        }}
      >
        <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-hidden p-0 gap-0 [&>button]:hidden">
          {detailTaskId ? (
            <TaskDetailPanel
              key={detailTaskId}
              taskId={detailTaskId}
              mode="modal"
              onClose={() => {
                setDetailTaskId(null);
                refreshAfterTaskDetail();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

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
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent className="z-[200]" position="popper">
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

