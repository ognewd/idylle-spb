'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heading1,
  Type,
  MousePointerClick,
  Image,
  Minus,
  Package,
  Grid3x3,
  Link as LinkIcon,
} from 'lucide-react';
import { EmailBlock } from '@/lib/email-marketing-renderer';

interface BlockSelectorProps {
  onSelectBlock: (type: EmailBlock['type']) => void;
}

const blockTypes: Array<{
  type: EmailBlock['type'];
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'heading',
    label: 'Заголовок',
    description: 'H1, H2, H3',
    icon: <Heading1 className="h-4 w-4" />,
  },
  {
    type: 'text',
    label: 'Текст',
    description: 'Rich text',
    icon: <Type className="h-4 w-4" />,
  },
  {
    type: 'button',
    label: 'Кнопка',
    description: 'CTA кнопка',
    icon: <MousePointerClick className="h-4 w-4" />,
  },
  {
    type: 'image',
    label: 'Изображение',
    description: 'Баннер/картинка',
    icon: <Image className="h-4 w-4" />,
  },
  {
    type: 'divider',
    label: 'Разделитель',
    description: 'Отступ',
    icon: <Minus className="h-4 w-4" />,
  },
  {
    type: 'product',
    label: 'Товар',
    description: 'Один товар',
    icon: <Package className="h-4 w-4" />,
  },
  {
    type: 'product-grid',
    label: 'Сетка товаров',
    description: '3, 6, 9 карточек',
    icon: <Grid3x3 className="h-4 w-4" />,
  },
  {
    type: 'links',
    label: 'Ссылки',
    description: 'Категории/разделы',
    icon: <LinkIcon className="h-4 w-4" />,
  },
];

export function BlockSelector({ onSelectBlock }: BlockSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Блоки</CardTitle>
        <CardDescription>Добавить блок</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {blockTypes.map((blockType) => (
          <Button
            key={blockType.type}
            variant="outline"
            className="w-full justify-start"
            onClick={() => onSelectBlock(blockType.type)}
          >
            <div className="flex items-center gap-2 flex-1">
              {blockType.icon}
              <div className="flex-1 text-left">
                <div className="font-medium">{blockType.label}</div>
                <div className="text-xs text-muted-foreground">{blockType.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
