'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Mail,
  Monitor,
  Smartphone,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmailBlock, EmailDesign } from '@/lib/email-marketing-renderer';
import { BlockEditor } from '@/components/email-marketing/BlockEditor';
import { BlockSelector } from '@/components/email-marketing/BlockSelector';
import { EmailPreview } from '@/components/email-marketing/EmailPreview';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailTemplate {
  id: string;
  name: string;
  subjectDefault: string | null;
  designJson: any;
  status: string;
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const isNew = templateId === 'new';

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [design, setDesign] = useState<EmailDesign>({
    blocks: [],
    settings: {
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      primaryColor: '#000000',
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isNew) {
      loadTemplate();
    } else {
      // Для нового шаблона создаем красивый шаблон с предзаполненным контентом
      setDesign({
        blocks: [
          // Шапка с логотипом на градиентном фоне
          {
            id: 'header-logo',
            type: 'image',
            data: {
              url: '/logo-idylle.png',
              alt: 'Idylle',
              alignment: 'center',
            },
          },
          {
            id: 'header-spacer',
            type: 'divider',
            data: {},
          },
          // Hero-секция с изображением Парижа
          {
            id: 'hero-image',
            type: 'image',
            data: {
              url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              alt: 'Париж',
              alignment: 'center',
            },
          },
          {
            id: 'hero-heading',
            type: 'heading',
            data: {
              text: 'Париж в каждом доме',
              level: 1,
            },
          },
          {
            id: 'hero-text',
            type: 'text',
            data: {
              content: '<p style="font-size: 18px; line-height: 1.8; color: #555; margin: 20px 0;">Окунитесь в атмосферу изысканности и роскоши с ароматами от <strong>Dr. Vranjes</strong>. Итальянское качество и французская элегантность в каждой капле.</p>',
            },
          },
          {
            id: 'hero-button',
            type: 'button',
            data: {
              text: 'Открыть коллекцию',
              url: '/catalog',
            },
          },
          {
            id: 'divider-1',
            type: 'divider',
            data: {},
          },
          // Продукт Dr Vranjes
          {
            id: 'product-heading',
            type: 'heading',
            data: {
              text: 'Рекомендуем',
              level: 2,
            },
          },
          {
            id: 'product-block',
            type: 'product',
            data: {
              productId: null, // Будет выбран позже
              productName: 'Dr. Vranjes - Firenze',
              productSlug: 'dr-vranjes-firenze',
              productPrice: 15000,
              productImageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              showPrice: true,
              description: 'Элитный аромат для дома от итальянского бренда Dr. Vranjes. Создает атмосферу уюта и роскоши, наполняя пространство неповторимым ароматом Флоренции.',
            },
          },
          {
            id: 'divider-2',
            type: 'divider',
            data: {},
          },
          // Сетка товаров
          {
            id: 'product-grid-heading',
            type: 'heading',
            data: {
              text: 'Популярные товары',
              level: 2,
            },
          },
          {
            id: 'product-grid-block',
            type: 'product-grid',
            data: {
              products: [
                {
                  productId: 'prod-1',
                  productName: 'Набор из трех штук мыла в форме розы розового цвета',
                  productSlug: 'product-1',
                  productPrice: 1290,
                  productImageUrl: '/uploads/products/1767642418175-3m6j0wje6x9.png',
                  showPrice: true,
                },
                {
                  productId: 'prod-2',
                  productName: 'Подарочный набор Фейерверк из шести фигурок',
                  productSlug: 'product-2',
                  productPrice: 1890,
                  productImageUrl: '/uploads/products/1767642418174-vtrgjmlwbos.png',
                  showPrice: true,
                },
                {
                  productId: 'prod-3',
                  productName: 'Набор лампа Берже Терра красная и аромат',
                  productSlug: 'product-3',
                  productPrice: 7990,
                  productImageUrl: '/uploads/products/1763157651508-ii72o1xpqj.png',
                  showPrice: true,
                },
              ],
              columns: 3,
            },
          },
          {
            id: 'divider-3',
            type: 'divider',
            data: {},
          },
          // Заключительный текст
          {
            id: 'footer-text',
            type: 'text',
            data: {
              content: '<p style="text-align: center; color: #888; font-size: 14px; margin: 30px 0;">Создайте неповторимую атмосферу в вашем доме<br>с коллекцией премиальных ароматов</p>',
            },
          },
        ],
        settings: {
          backgroundColor: '#f8f6f4',
          fontFamily: '"Georgia", "Times New Roman", serif',
          primaryColor: '#8b6f47',
        },
      });
      setLoading(false);
    }
  }, [templateId, isNew]);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/email/marketing/templates/${templateId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to load template');
      
      const data = await response.json();
      setTemplate(data);
      
      if (data.designJson) {
        setDesign(typeof data.designJson === 'string' 
          ? JSON.parse(data.designJson) 
          : data.designJson
        );
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки шаблона' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const name = (document.getElementById('template-name') as HTMLInputElement)?.value || 'Без названия';
      const subjectDefault = (document.getElementById('template-subject') as HTMLInputElement)?.value || null;

      const payload = {
        name,
        subjectDefault,
        designJson: design,
        status: template?.status || 'draft',
      };

      const url = isNew 
        ? '/api/admin/email/marketing/templates'
        : `/api/admin/email/marketing/templates/${templateId}`;
      
      const method = isNew ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save template');
      }

      const saved = await response.json();
      setMessage({ type: 'success', text: 'Шаблон сохранен!' });
      
      if (isNew) {
        router.push(`/admin/email/marketing/templates/${saved.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setMessage({ type: 'error', text: 'Ошибка сохранения шаблона' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = (blockType: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      data: getDefaultBlockData(blockType),
    };

    setDesign({
      ...design,
      blocks: [...design.blocks, newBlock],
    });
    setSelectedBlock(newBlock.id);
  };

  const handleDeleteBlock = (blockId: string) => {
    setDesign({
      ...design,
      blocks: design.blocks.filter(b => b.id !== blockId),
    });
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
    }
  };

  const handleUpdateBlock = (blockId: string, data: any) => {
    setDesign((prevDesign) => ({
      ...prevDesign,
      blocks: prevDesign.blocks.map(block =>
        block.id === blockId ? { ...block, data } : block
      ),
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDesign((prevDesign) => {
        const oldIndex = prevDesign.blocks.findIndex(block => block.id === active.id);
        const newIndex = prevDesign.blocks.findIndex(block => block.id === over.id);

        return {
          ...prevDesign,
          blocks: arrayMove(prevDesign.blocks, oldIndex, newIndex),
        };
      });
    }
  };

  const getDefaultBlockData = (type: EmailBlock['type']): any => {
    switch (type) {
      case 'heading':
        return { text: 'Заголовок', level: 1 };
      case 'text':
        return { content: 'Текст' };
      case 'button':
        return { text: 'Кнопка', url: '#' };
      case 'image':
        return { url: '', alt: '' };
      case 'divider':
        return {};
      case 'product':
        return { productId: null, showPrice: true, description: '' };
      case 'product-grid':
        return { products: [], columns: 3 };
      case 'links':
        return { links: [] };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin/email/marketing/templates" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к шаблонам
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isNew ? 'Создать шаблон' : 'Редактировать шаблон'}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1 max-w-xs">
                <Label htmlFor="template-name">Название шаблона</Label>
                <Input
                  id="template-name"
                  defaultValue={template?.name || ''}
                  placeholder="Введите название"
                />
              </div>
              <div className="flex-1 max-w-xs">
                <Label htmlFor="template-subject">Тема письма</Label>
                <Input
                  id="template-subject"
                  defaultValue={template?.subjectDefault || ''}
                  placeholder="Тема письма"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showPreview ? 'default' : 'outline'}
              onClick={() => {
                const newPreviewState = !showPreview;
                // При включении предпросмотра всегда сбрасываем выбранный блок
                if (newPreviewState) {
                  setSelectedBlock(null);
                }
                setShowPreview(newPreviewState);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Предпросмотр
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
        {message && (
          <Alert className={`mt-4 ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Block Selector */}
        <div className="col-span-3">
          <BlockSelector onSelectBlock={handleAddBlock} />
        </div>

        {/* Center - Constructor */}
        <div className={`${showPreview ? 'col-span-4' : 'col-span-6'} transition-all`}>
          <Card>
            <CardHeader>
              <CardTitle>Конструктор</CardTitle>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={design.blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {design.blocks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Начните с добавления блока</p>
                        <p className="text-sm mt-2">Выберите блок слева</p>
                      </div>
                    ) : (
                      design.blocks.map((block) => (
                        <SortableBlock
                          key={block.id}
                          block={block}
                          isSelected={selectedBlock === block.id && !showPreview}
                          onSelect={() => {
                            // При клике на блок выключаем предпросмотр и выбираем блок
                            setShowPreview(false);
                            setSelectedBlock(block.id);
                          }}
                          onDelete={handleDeleteBlock}
                          onUpdate={(data) => handleUpdateBlock(block.id, data)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Preview / Block Editor */}
        <div className={`${showPreview ? 'col-span-5' : 'col-span-3'} transition-all`}>
          {showPreview ? (
            <EmailPreview
              design={design}
              mode={previewMode}
              onModeChange={setPreviewMode}
            />
          ) : selectedBlock ? (
            <BlockEditor
              block={design.blocks.find(b => b.id === selectedBlock)!}
              onUpdate={(data) => handleUpdateBlock(selectedBlock, data)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Выберите блок</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Выберите блок в конструкторе для редактирования
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Sortable Block Component
function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onUpdate: (data: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium capitalize">
            {block.type === 'heading' && 'Заголовок'}
            {block.type === 'text' && 'Текст'}
            {block.type === 'button' && 'Кнопка'}
            {block.type === 'image' && 'Изображение'}
            {block.type === 'divider' && 'Разделитель'}
            {block.type === 'product' && 'Товар'}
            {block.type === 'product-grid' && 'Сетка товаров'}
            {block.type === 'links' && 'Ссылки'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <BlockPreview block={block} />
    </div>
  );
}

// Block Preview Component
function BlockPreview({ block }: { block: EmailBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="text-lg font-bold">
          {block.data.text || 'Заголовок'}
        </div>
      );
    case 'text':
      return (
        <div className="text-sm" dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.data.content || 'Текст') }} />
      );
    case 'button':
      return (
        <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded">
          {block.data.text || 'Кнопка'}
        </div>
      );
    case 'image':
      return (
        <div className="text-sm text-muted-foreground">
          {block.data.url ? (
            <img src={block.data.url} alt={block.data.alt} className="max-w-full h-auto rounded" />
          ) : (
            'Изображение'
          )}
        </div>
      );
    case 'divider':
      return <div className="border-t my-2" />;
    case 'product':
      if (block.data.productId && block.data.productName) {
        return (
          <div className="space-y-1">
            {block.data.productImageUrl && (
              <img 
                src={block.data.productImageUrl} 
                alt={block.data.productName} 
                className="w-full h-20 object-cover rounded"
              />
            )}
            <div className="text-sm font-medium">{block.data.productName}</div>
            {block.data.showPrice !== false && block.data.productPrice && (
              <div className="text-xs text-primary font-semibold">
                {Number(block.data.productPrice).toLocaleString('ru-RU')} ₽
              </div>
            )}
          </div>
        );
      }
      return (
        <div className="text-sm text-muted-foreground">
          Товар не выбран
        </div>
      );
    case 'product-grid':
      const products = block.data.products || [];
      if (products.length > 0) {
        return (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {products.length} товаров ({block.data.columns || 3} колонок)
            </div>
            <div className="grid grid-cols-3 gap-1">
              {products.slice(0, 3).map((p: any, idx: number) => (
                <div key={idx} className="text-xs truncate">
                  {p.productImageUrl && (
                    <img src={p.productImageUrl} alt={p.productName || ''} className="w-full h-12 object-cover rounded mb-1" />
                  )}
                  <div className="truncate">{p.productName || 'Товар'}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return (
        <div className="text-sm text-muted-foreground">
          Товары не выбраны
        </div>
      );
    default:
      return <div className="text-sm text-muted-foreground">Блок</div>;
  }
}
