'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Edit, Code } from 'lucide-react';

// Динамически загружаем ReactQuill только на клиенте
// @ts-ignore - react-quill не имеет типов в @types
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import '@/app/quill.css';

interface CategoryContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

// Функция для очистки HTML от лишних пробелов и <br>
// Убирает отступы между параграфами, которые не видны в редакторе
function cleanHtml(html: string): string {
  if (!html) return '';
  
  return html
    // Убираем <br> между параграфами - это создает лишние отступы
    .replace(/<\/p>\s*<br\s*\/?>\s*<p>/gi, '</p><p>')
    .replace(/<\/p>\s*<br>\s*<p>/gi, '</p><p>')
    // Убираем пустые параграфы с <br> - это создает отступы
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
    .replace(/<p>\s*<br>\s*<\/p>/gi, '')
    // Убираем множественные <br> подряд - оставляем максимум один
    .replace(/(<br\s*\/?>)\s*(<br\s*\/?>)+/gi, '<br>')
    // Убираем полностью пустые параграфы (без содержимого)
    .replace(/<p>\s*<\/p>/gi, '')
    // Убираем <br> в конце параграфов (они создают отступы)
    .replace(/<br\s*\/?>\s*<\/p>/gi, '</p>')
    // Убираем <br> в начале параграфов
    .replace(/<p>\s*<br\s*\/?>/gi, '<p>')
    .trim();
}

export function CategoryContentEditor({ 
  value, 
  onChange, 
  label = 'Контент страницы категории' 
}: CategoryContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'html'>('edit');
  const [htmlCode, setHtmlCode] = useState(value || '');

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
    // Настройки для предотвращения лишних <br>
    clipboard: {
      matchVisual: false, // Не добавлять лишние <br> при вставке
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image',
    'color', 'background'
  ];

  // Обработчик изменения в HTML редакторе
  const handleHtmlChange = (html: string) => {
    setHtmlCode(html);
    // Не очищаем при вводе - передаем как есть
    onChange(html);
  };

  // Обработчик изменения в Quill редакторе
  const handleQuillChange = (content: string) => {
    // Quill возвращает HTML напрямую - передаем как есть без очистки
    // Очистка будет только при сохранении
    setHtmlCode(content);
    onChange(content);
  };

  // При переключении на HTML вкладку, обновляем код
  const handleTabChange = (tab: string) => {
    if (tab === 'html') {
      // Когда переключаемся на HTML, показываем текущее значение
      setHtmlCode(value || '');
    } else if (tab === 'edit' && activeTab === 'html' && htmlCode !== value) {
      // Когда переключаемся на редактирование из HTML, используем HTML код
      // Но не очищаем - пусть Quill сам обработает
      onChange(htmlCode);
    }
    setActiveTab(tab as 'edit' | 'preview' | 'html');
  };
  
  // Синхронизация htmlCode при изменении value извне
  useEffect(() => {
    if (activeTab !== 'html' && value !== htmlCode) {
      setHtmlCode(value || '');
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Редактировать
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Предпросмотр
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            HTML
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4">
          <div className="border rounded-lg overflow-hidden">
            <ReactQuill
              theme="snow"
              value={value || ''}
              onChange={handleQuillChange}
              modules={modules}
              formats={formats}
              placeholder="Введите текст для страницы категории..."
              style={{
                minHeight: '300px',
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Используйте редактор для форматирования текста. Лишние пробелы и переносы автоматически удаляются при сохранении.
          </p>
        </TabsContent>
        
        <TabsContent value="html" className="mt-4">
          <div className="space-y-2">
            <Label>HTML код</Label>
            <Textarea
              value={htmlCode}
              onChange={(e) => handleHtmlChange(e.target.value)}
              placeholder="Вставьте или отредактируйте HTML код..."
              className="font-mono text-sm"
              rows={12}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Редактируйте HTML код напрямую. Лишние пробелы будут автоматически удалены при сохранении.
              </p>
              <button
                type="button"
                onClick={() => {
                  const cleaned = cleanHtml(htmlCode);
                  setHtmlCode(cleaned);
                  onChange(cleaned);
                }}
                className="text-xs text-primary hover:underline px-2 py-1 rounded hover:bg-primary/10"
              >
                Очистить пробелы
              </button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <div 
            className="border rounded-lg p-6 bg-white min-h-[300px] prose prose-sm max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-p:mb-4 prose-p:last:mb-0 prose-ul:list-disc prose-ol:list-decimal prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-img:rounded-lg prose-img:shadow-sm"
            style={{
              minHeight: '300px',
            }}
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground">Контент пуст. Начните редактирование, чтобы увидеть предпросмотр.</p>' }}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Так будет выглядеть контент на странице категории для пользователей.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

