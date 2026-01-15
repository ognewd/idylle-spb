'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { EmailBlock } from '@/lib/email-marketing-renderer';
import { ProductPicker } from './ProductPicker';
import { ProductGridPicker } from './ProductGridPicker';

interface BlockEditorProps {
  block: EmailBlock;
  onUpdate: (data: any) => void;
}

export function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const [data, setData] = useState(block.data);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showProductGridPicker, setShowProductGridPicker] = useState(false);

  useEffect(() => {
    setData(block.data);
  }, [block.id, block.data]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(newData);
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'heading':
        return (
          <>
            <div className="space-y-2">
              <Label>Текст заголовка</Label>
              <Input
                value={data.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Уровень (H1, H2, H3)</Label>
              <Select
                value={String(data.level || 1)}
                onValueChange={(value) => handleChange('level', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Label>Содержимое</Label>
            <Textarea
              value={data.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={6}
              placeholder="Введите текст..."
            />
            <p className="text-xs text-muted-foreground">
              Поддерживается HTML разметка
            </p>
          </div>
        );

      case 'button':
        return (
          <>
            <div className="space-y-2">
              <Label>Текст кнопки</Label>
              <Input
                value={data.text || ''}
                onChange={(e) => handleChange('text', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={data.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div className="space-y-2">
              <Label>URL изображения</Label>
              <Input
                value={data.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Alt текст</Label>
              <Input
                value={data.alt || ''}
                onChange={(e) => handleChange('alt', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Выравнивание</Label>
              <Select
                value={data.alignment || 'center'}
                onValueChange={(value) => handleChange('alignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Слева</SelectItem>
                  <SelectItem value="center">По центру</SelectItem>
                  <SelectItem value="right">Справа</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'divider':
        return (
          <div className="text-sm text-muted-foreground">
            Разделитель не требует настройки
          </div>
        );

      case 'product':
        return (
          <>
            {data.productId && data.productName && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="font-medium">{data.productName}</div>
                {data.productPrice && (
                  <div className="text-sm text-muted-foreground">
                    {data.productPrice.toLocaleString('ru-RU')} ₽
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Товар</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowProductPicker(true)}
              >
                {data.productId ? 'Изменить товар' : 'Выбрать товар'}
              </Button>
            </div>
            <ProductPicker
              open={showProductPicker}
              onClose={() => setShowProductPicker(false)}
              onSelect={(product) => {
                const newData = {
                  ...data,
                  productId: product.id,
                  productName: product.name,
                  productSlug: product.slug,
                  productPrice: Number(product.price),
                  productImageUrl: product.images?.[0]?.url || '',
                  // Сохраняем customTitle если он был задан, иначе сбрасываем
                  customTitle: data.customTitle || '',
                };
                setData(newData);
                onUpdate(newData);
                setShowProductPicker(false);
              }}
              selectedProductId={data.productId}
            />
            {data.productId && data.productName && (
              <div className="space-y-2 mt-4">
                <Label>Название для письма (необязательно)</Label>
                <Input
                  value={data.customTitle || ''}
                  onChange={(e) => handleChange('customTitle', e.target.value)}
                  placeholder={data.productName}
                />
                <p className="text-xs text-muted-foreground">
                  Оставьте пустым, чтобы использовать название товара
                </p>
              </div>
            )}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="show-price"
                checked={data.showPrice !== false}
                onCheckedChange={(checked) => handleChange('showPrice', checked)}
              />
              <Label htmlFor="show-price" className="cursor-pointer">
                Показывать цену
              </Label>
            </div>
            <div className="space-y-2 mt-4">
              <Label>Описание акции/новости</Label>
              <Textarea
                value={data.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Дополнительный текст..."
              />
            </div>
          </>
        );

      case 'product-grid':
        const currentProducts = data.products || [];
        return (
          <>
            <div className="space-y-2">
              <Label>Количество колонок</Label>
              <Select
                value={String(data.columns || 3)}
                onValueChange={(value) => handleChange('columns', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 товара</SelectItem>
                  <SelectItem value="6">6 товаров</SelectItem>
                  <SelectItem value="9">9 товаров</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mt-4">
              <Label>Товары ({currentProducts.length})</Label>
              {currentProducts.length > 0 && (
                <div className="space-y-3 mb-2">
                  {currentProducts.map((p: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        {p.productImageUrl && (
                          <img src={p.productImageUrl} alt={p.productName || ''} className="w-10 h-10 object-cover rounded" />
                        )}
                        <span className="flex-1 truncate text-xs text-muted-foreground">{p.productName || 'Товар'}</span>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Название для письма (необязательно)</Label>
                        <Input
                          value={p.customTitle || ''}
                          onChange={(e) => {
                            const updatedProducts = [...currentProducts];
                            updatedProducts[idx] = { ...updatedProducts[idx], customTitle: e.target.value };
                            handleChange('products', updatedProducts);
                          }}
                          placeholder={p.productName || 'Товар'}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowProductGridPicker(true)}
              >
                {currentProducts.length > 0 ? 'Изменить товары' : 'Добавить товары'}
              </Button>
            </div>
            <ProductGridPicker
              open={showProductGridPicker}
              onClose={() => setShowProductGridPicker(false)}
              onSelect={(products) => {
                // Сохраняем customTitle для существующих товаров
                const existingProductsMap = new Map(currentProducts.map((p: any) => [p.productId, p.customTitle || '']));
                
                const formattedProducts = products.map(p => ({
                  productId: p.id,
                  productName: p.name,
                  productSlug: p.slug,
                  productPrice: Number(p.price),
                  productImageUrl: p.images?.[0]?.url || '',
                  showPrice: true,
                  customTitle: existingProductsMap.get(p.id) || '', // Сохраняем customTitle если был
                }));
                
                // Автоматически определить количество колонок
                let columns = data.columns || 3;
                if (formattedProducts.length > 0 && formattedProducts.length <= 3) {
                  columns = formattedProducts.length;
                } else if (formattedProducts.length > 3) {
                  columns = 3;
                }
                
                // Обновить все данные за один раз
                const newData = {
                  ...data,
                  products: formattedProducts,
                  columns,
                };
                setData(newData);
                onUpdate(newData);
                setShowProductGridPicker(false);
              }}
              selectedProducts={currentProducts.map((p: any) => ({
                id: p.productId,
                name: p.productName,
                slug: p.productSlug,
                price: p.productPrice,
                stock: 0,
                brand: { name: '' },
                images: p.productImageUrl ? [{ url: p.productImageUrl }] : [],
              }))}
              maxProducts={9}
            />
          </>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Настройки для этого блока отсутствуют
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">
          {block.type === 'heading' && 'Заголовок'}
          {block.type === 'text' && 'Текст'}
          {block.type === 'button' && 'Кнопка'}
          {block.type === 'image' && 'Изображение'}
          {block.type === 'divider' && 'Разделитель'}
          {block.type === 'product' && 'Товар'}
          {block.type === 'product-grid' && 'Сетка товаров'}
          {block.type === 'links' && 'Ссылки'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderEditor()}
      </CardContent>
    </Card>
  );
}
