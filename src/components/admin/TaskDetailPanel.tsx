'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, FileText, Download, Calendar, User, CheckCircle2, Clock, Circle, Edit2, Trash2, Paperclip, X, Eye, File, AlertCircle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getImageUrl } from '@/lib/image-url';

interface TaskFile {
  id: string;
  url: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
}

// Компонент для предпросмотра файла
function FilePreviewItem({ file }: { file: TaskFile }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const isImage = file.fileType?.startsWith('image/');
  const isPdf = file.fileType === 'application/pdf';
  const isWord = file.fileType?.includes('wordprocessingml') || file.fileName?.endsWith('.doc') || file.fileName?.endsWith('.docx');
  const isExcel = file.fileType?.includes('spreadsheetml') || file.fileName?.endsWith('.xls') || file.fileName?.endsWith('.xlsx');

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Неизвестно';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const handlePreview = () => {
    if (isImage || isPdf) {
      setPreviewUrl(file.url);
      setIsPreviewOpen(true);
      setPreviewError(false);
      setImageLoaded(false);
    } else {
      // Для Word и Excel открываем в новой вкладке (браузер может показать предпросмотр или скачать)
      window.open(file.url, '_blank');
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    // Если клик по самому изображению, не закрываем
    e.stopPropagation();
  };

  const handleBackdropClick = () => {
    setIsPreviewOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {isImage ? (
              <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200 bg-gray-100">
                {!thumbnailError ? (
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handlePreview}
                    onError={() => setThumbnailError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                )}
              </div>
            ) : isWord ? (
              <FileText className="h-5 w-5 text-blue-600" />
            ) : isExcel ? (
              <FileText className="h-5 w-5 text-green-600" />
            ) : isPdf ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : (
              <File className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.fileName}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {(isImage || isPdf) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              title="Предпросмотр"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(file.url, '_blank')}
            title="Скачать"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Улучшенный диалог предпросмотра для изображений */}
      {isImage && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent 
            className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
            onClick={handleBackdropClick}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Кнопка закрытия */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Изображение */}
              {previewUrl && (
                <div 
                  className="max-w-full max-h-[90vh] flex items-center justify-center"
                  onClick={handleImageClick}
                >
                  {!previewError ? (
                    <img
                      src={getImageUrl(previewUrl)}
                      alt={file.fileName}
                      className="max-w-full max-h-[90vh] object-contain rounded-lg"
                      onLoad={() => setImageLoaded(true)}
                      onError={() => {
                        setPreviewError(true);
                        setImageLoaded(false);
                      }}
                      style={{ display: imageLoaded ? 'block' : 'none' }}
                    />
                  ) : (
                    <div className="text-center py-8 text-white">
                      <p className="mb-4">Не удалось загрузить изображение</p>
                      <Button
                        variant="outline"
                        className="bg-white text-black hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Скачать файл
                      </Button>
                    </div>
                  )}
                  
                  {/* Индикатор загрузки */}
                  {!imageLoaded && !previewError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Название файла внизу */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                {file.fileName}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог предпросмотра для PDF */}
      {isPdf && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{file.fileName}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[80vh] overflow-auto">
              {previewUrl && !previewError && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0"
                  title={file.fileName}
                  onError={() => setPreviewError(true)}
                />
              )}
              {previewError && (
                <div className="text-center py-8 text-gray-500">
                  <p>Не удалось загрузить предпросмотр</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Скачать файл
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Компонент для предпросмотра файла в сообщении
function MessageFilePreview({ fileUrl, fileName }: { fileUrl: string; fileName: string }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Определяем тип файла по расширению
  const getFileType = (filename: string, url: string): string | null => {
    const ext = filename.split('.').pop()?.toLowerCase() || url.split('.').pop()?.toLowerCase();
    if (!ext) return null;
    
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const pdfExts = ['pdf'];
    const wordExts = ['doc', 'docx'];
    const excelExts = ['xls', 'xlsx'];
    
    if (imageExts.includes(ext)) return 'image';
    if (pdfExts.includes(ext)) return 'pdf';
    if (wordExts.includes(ext)) return 'word';
    if (excelExts.includes(ext)) return 'excel';
    return null;
  };

  const fileType = getFileType(fileName, fileUrl);
  const isImage = fileType === 'image';
  const isPdf = fileType === 'pdf';

  const handlePreview = () => {
    if (isImage || isPdf) {
      setIsPreviewOpen(true);
      setPreviewError(false);
      setImageLoaded(false);
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBackdropClick = () => {
    setIsPreviewOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
        {isImage ? (
          <div className="relative w-10 h-10 rounded overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
            {!thumbnailError ? (
              <img
                src={getImageUrl(fileUrl)}
                alt={fileName}
                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handlePreview}
                onError={() => setThumbnailError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
            )}
          </div>
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm flex-1 truncate">{fileName}</span>
        {(isImage || isPdf) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            title="Предпросмотр"
            className="flex-shrink-0"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(fileUrl, '_blank')}
          title="Скачать"
          className="flex-shrink-0"
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>

      {/* Улучшенный диалог предпросмотра для изображений */}
      {isImage && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent 
            className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
            onClick={handleBackdropClick}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Кнопка закрытия */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Изображение */}
              <div 
                className="max-w-full max-h-[90vh] flex items-center justify-center"
                onClick={handleImageClick}
              >
                {!previewError ? (
                  <img
                    src={getImageUrl(fileUrl)}
                    alt={fileName}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setPreviewError(true);
                      setImageLoaded(false);
                    }}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                  />
                ) : (
                  <div className="text-center py-8 text-white">
                    <p className="mb-4">Не удалось загрузить изображение</p>
                    <Button
                      variant="outline"
                      className="bg-white text-black hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(fileUrl, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Скачать файл
                    </Button>
                  </div>
                )}
                
                {/* Индикатор загрузки */}
                {!imageLoaded && !previewError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Название файла внизу */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                {fileName}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Диалог предпросмотра для PDF */}
      {isPdf && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{fileName}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[80vh] overflow-auto">
              {!previewError ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-[70vh] border-0"
                  title={fileName}
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Не удалось загрузить предпросмотр</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Скачать файл
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'new' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'normal' | 'someday';
  createdAt: string;
  updatedAt: string;
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
  messages: TaskMessage[];
}

interface TaskMessage {
  id: string;
  message: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
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

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
}

export type TaskDetailPanelProps = {
  taskId: string;
  mode?: 'page' | 'modal';
  onClose?: () => void;
};

export function TaskDetailPanel({ taskId, mode = 'page', onClose }: TaskDetailPanelProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'new' | 'in_progress' | 'review' | 'done'>('new');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string | null; email: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [selectedAssigneeEmail, setSelectedAssigneeEmail] = useState<string>('');
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const goBack = useCallback(() => {
    if (onClose) onClose();
    else router.push('/admin/tasks');
  }, [onClose, router]);

  useEffect(() => {
    isInitialLoadRef.current = true;
  }, [taskId]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    // Получаем информацию о текущем пользователе
    fetch('/api/admin/user/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        // Fallback: получаем из токена
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({
            id: payload.userId,
            name: payload.name || null,
            email: payload.email,
          });
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      });
    
    loadTask();
    loadAdmins();
    
    // Обновляем задачу каждые 5 секунд для получения новых сообщений
    const interval = setInterval(() => {
      loadTask();
    }, 5000);

    return () => clearInterval(interval);
  }, [router, taskId]);

  const loadAdmins = async () => {
    try {
      setIsLoadingAdmins(true);
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch('/api/admin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admins) {
          setAdmins(data.admins.filter((admin: AdminUser) => admin.isActive));
        }
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleAssignTask = async (email: string | null) => {
    if (isUpdatingAssignee) return;
    
    setIsUpdatingAssignee(true);
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
        body: JSON.stringify({ assignedToEmail: email || null }),
      });

      if (response.ok) {
        await loadTask();
        setSelectedAssigneeEmail(email || '');
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Ошибка при назначении задачи.');
    } finally {
      setIsUpdatingAssignee(false);
    }
  };

  // Проверяем, находится ли пользователь внизу чата
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return false;
    const container = messagesContainerRef.current;
    const threshold = 100; // пикселей от низа
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Отключен автоскролл - пользователь сам контролирует позицию прокрутки
  useEffect(() => {
    if (task?.messages && task.messages.length > 0) {
      // Пропускаем первую загрузку - не скроллим
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        return;
      }
      
      // Автоскролл отключен - не скроллим при изменении сообщений
      // Пользователь может сам прокрутить вниз, если нужно
    }
  }, [task?.messages?.length]); // Только при изменении количества сообщений

  // Функция отключена - автоскролл больше не используется
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

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
        setSelectedAssigneeEmail(data.assignedTo?.email || '');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to load task:', errorData);
        if (response.status === 404) {
          alert('Задача не найдена');
          goBack();
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

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('application/')) {
      alert('Файл должен быть изображением или документом');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла должен быть меньше 10MB');
      return;
    }

    setMessageFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message?.trim() && !messageFile) || isSending) return;

    setIsSending(true);
    
    // Сохраняем текущую позицию скролла
    const scrollContainer = messagesContainerRef.current;
    const savedScrollTop = scrollContainer?.scrollTop || 0;
    const savedScrollHeight = scrollContainer?.scrollHeight || 0;
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Вы не авторизованы.');
        router.push('/admin/login');
        return;
      }

      let response;
      if (messageFile) {
        // Отправляем с файлом через FormData
        const formData = new FormData();
        if (message?.trim()) {
          formData.append('message', message.trim());
        }
        formData.append('file', messageFile);

        response = await fetch(`/api/admin/tasks/${taskId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Отправляем только текст
        response = await fetch(`/api/admin/tasks/${taskId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ message: message?.trim() || '' }),
        });
      }

      if (response.ok) {
        setMessage('');
        setMessageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await loadTask();
        
        // Восстанавливаем позицию скролла после загрузки
        // Используем requestAnimationFrame чтобы дождаться рендера
        requestAnimationFrame(() => {
          if (scrollContainer) {
            const newScrollHeight = scrollContainer.scrollHeight;
            const scrollDiff = newScrollHeight - savedScrollHeight;
            // Восстанавливаем позицию с учетом нового контента
            scrollContainer.scrollTop = savedScrollTop + scrollDiff;
          }
        });
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

  const handleEditMessage = (msg: TaskMessage) => {
    setEditingMessageId(msg.id);
    setEditMessageText(msg.message);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessageText('');
  };

  const handleSaveEdit = async (messageId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Вы не авторизованы.');
        return;
      }

      const response = await fetch(`/api/admin/tasks/${taskId}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: editMessageText.trim() }),
      });

      if (response.ok) {
        setEditingMessageId(null);
        setEditMessageText('');
        await loadTask();
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Ошибка при редактировании сообщения.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Вы не авторизованы.');
        return;
      }

      const response = await fetch(`/api/admin/tasks/${taskId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadTask();
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Ошибка при удалении сообщения.');
    }
  };

  const handleStatusChange = async (newStatus: 'new' | 'in_progress' | 'review' | 'done') => {
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

  const loadingShell =
    mode === 'modal' ? 'py-16 min-h-[200px]' : 'min-h-screen bg-gray-50';

  if (isLoading) {
    return (
      <div className={`${loadingShell} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка задачи...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className={`${loadingShell} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-gray-600">Задача не найдена</p>
          <Button onClick={goBack} className="mt-4">
            {mode === 'modal' ? 'Закрыть' : 'Вернуться к списку задач'}
          </Button>
        </div>
      </div>
    );
  }

  const headerBadges = (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
      <Badge variant="outline" className={priorityColors[task.priority]}>
        {priorityLabels[task.priority]}
      </Badge>
      <Badge
        variant="outline"
        className={
          task.assignedTo
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-gray-50 text-gray-500 border-gray-200'
        }
      >
        <User className="h-3 w-3 mr-1" />
        {task.assignedTo
          ? `Назначено: ${task.assignedTo.name || task.assignedTo.email}`
          : 'Не назначено'}
      </Badge>
    </div>
  );

  return (
    <div className={mode === 'modal' ? 'bg-gray-50' : 'min-h-screen bg-gray-50'}>
      {mode === 'modal' ? (
        <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
          <div className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 leading-tight break-words">{task.title}</h2>
              <div className="mt-1">{headerBadges}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0" aria-label="Закрыть">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>
      ) : (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
                  {headerBadges}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className={mode === 'modal' ? 'px-4 py-4 max-h-[calc(90vh-5rem)] overflow-y-auto' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
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
                {task.files && task.files.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Прикрепленные файлы ({task.files.length}):</h4>
                    <div className="space-y-2">
                      {task.files.map((file) => (
                        <FilePreviewItem key={file.id} file={file} />
                      ))}
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
                <div 
                  ref={messagesContainerRef}
                  className="space-y-4 mb-4 max-h-96 overflow-y-auto"
                >
                  {task.messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Пока нет сообщений. Начните обсуждение!
                    </p>
                  ) : (
                    task.messages.map((msg) => {
                      const isOwnMessage = currentUser && msg.user.id === currentUser.id;
                      const isEditing = editingMessageId === msg.id;
                      
                      return (
                        <div key={msg.id} className="space-y-1 group">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {msg.user.name || msg.user.email}
                            </span>
                            <span className="text-muted-foreground">
                              {formatTime(msg.createdAt)}
                            </span>
                            {isOwnMessage && !isEditing && (
                              <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => handleEditMessage(msg)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-destructive"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="bg-muted rounded-lg p-3 ml-6">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editMessageText}
                                  onChange={(e) => setEditMessageText(e.target.value)}
                                  rows={3}
                                  className="w-full"
                                />
                                {msg.fileUrl && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>{msg.fileName}</span>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(msg.id)}
                                  >
                                    Сохранить
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    Отмена
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.message && msg.message.trim() && (
                                  <p className="whitespace-pre-wrap">{msg.message}</p>
                                )}
                                {msg.fileUrl && (
                                  <div className="mt-2 pt-2 border-t">
                                    <MessageFilePreview fileUrl={msg.fileUrl} fileName={msg.fileName || 'Файл'} />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <Separator className="my-4" />

                <form 
                  onSubmit={handleSendMessage} 
                  className="space-y-2"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div 
                    className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : messageFile 
                          ? 'border-primary' 
                          : 'border-muted'
                    }`}
                  >
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Напишите сообщение... (или перетащите файл сюда)"
                      rows={3}
                      disabled={isSending}
                      className="resize-none"
                    />
                    {messageFile && (
                      <div className="mt-2 flex items-center gap-2 text-sm bg-background rounded p-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{messageFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => {
                            setMessageFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileInputChange}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Вложить файл
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSending || (!message.trim() && !messageFile)}
                    >
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
                  <Label className="text-xs text-muted-foreground">Назначено на</Label>
                  <div className="mt-2 space-y-2">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <p className="font-medium text-blue-600 flex-1">
                          {task.assignedTo.name || task.assignedTo.email}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignTask(null)}
                          disabled={isUpdatingAssignee}
                          className="h-6 px-2 text-xs"
                          title="Снять назначение"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p className="font-medium text-gray-400 italic text-sm mb-2">Не назначено</p>
                    )}
                    <Select
                      value={selectedAssigneeEmail || undefined}
                      onValueChange={(value) => {
                        setSelectedAssigneeEmail(value);
                        handleAssignTask(value);
                      }}
                      disabled={isUpdatingAssignee || isLoadingAdmins}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder={task.assignedTo ? "Изменить назначение" : "Назначить на..."} />
                      </SelectTrigger>
                      <SelectContent className="z-[210]" position="popper">
                        {admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.email}>
                            {admin.name || admin.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {task.assignedTo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignTask(null)}
                        disabled={isUpdatingAssignee}
                        className="w-full mt-2 h-8 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Снять назначение
                      </Button>
                    )}
                  </div>
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
                    <SelectContent className="z-[210]" position="popper">
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
                      <SelectItem value="review">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-purple-500" />
                          На проверке
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

