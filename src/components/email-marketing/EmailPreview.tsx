'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Maximize2, Minimize2 } from 'lucide-react';
import { EmailDesign } from '@/lib/email-marketing-renderer';

interface EmailPreviewProps {
  design: EmailDesign;
  mode: 'desktop' | 'mobile';
  onModeChange: (mode: 'desktop' | 'mobile') => void;
}

export function EmailPreview({ design, mode, onModeChange }: EmailPreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Для предпросмотра используем простой рендеринг без API
  // В реальном приложении можно вызвать API для рендеринга
  const generatePreview = () => {
    setLoading(true);
    // Имитация рендеринга
    setTimeout(() => {
      const html = renderPreview(design);
      setPreviewHtml(html);
      setLoading(false);
    }, 300);
  };

  // Auto-generate preview when design changes
  useEffect(() => {
    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(design)]);

  // Desktop preview width: 600px (стандартная ширина email)
  // Mobile preview width: 375px (стандартная ширина iPhone)
  const previewWidth = mode === 'mobile' ? 375 : 600;
  const scale = mode === 'mobile' ? 0.8 : 1;

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Предпросмотр</CardTitle>
            <div className="flex gap-1 ml-4">
              <Button
                variant={mode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onModeChange('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={mode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onModeChange('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(false)}
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Закрыть
          </Button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-8">
          {loading ? (
            <div className="text-center py-8 text-white">Загрузка...</div>
          ) : (
            <div
              className="border-4 border-white rounded-lg bg-white shadow-2xl overflow-auto"
              style={{
                width: `${previewWidth}px`,
                maxHeight: '90vh',
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
              }}
            >
              <iframe
                srcDoc={previewHtml}
                className="border-0 w-full"
                style={{
                  minHeight: '800px',
                  pointerEvents: 'auto',
                }}
                title="Email Preview"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle>Предпросмотр</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={mode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={mode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              title="Полноэкранный просмотр"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : (
          <div className="flex items-start justify-center min-h-full p-4">
            <div
              className="border-2 border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden"
              style={{
                width: `${previewWidth}px`,
                maxWidth: '100%',
              }}
            >
              <iframe
                srcDoc={previewHtml}
                className="border-0 w-full"
                style={{
                  minHeight: '600px',
                  display: 'block',
                }}
                title="Email Preview"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function renderPreview(design: EmailDesign): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:3000';
  
  const backgroundColor = design.settings?.backgroundColor || '#f8f6f4';
  const primaryColor = design.settings?.primaryColor || '#8b6f47';
  const fontFamily = design.settings?.fontFamily || '"Georgia", "Times New Roman", serif';
  const logoUrl = `${baseUrl}/logo-idylle.png`;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${fontFamily}; }
    .email-wrapper { background-color: ${backgroundColor}; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%); padding: 30px 20px; text-align: center; }
    .header img { max-width: 200px; height: auto; filter: brightness(0) invert(1); }
    .content { padding: 30px; }
    h1 { color: ${primaryColor}; margin: 20px 0 15px 0; font-size: 32px; font-weight: 700; line-height: 1.3; }
    h2 { color: ${primaryColor}; margin: 25px 0 15px 0; font-size: 24px; font-weight: 600; }
    h3 { color: ${primaryColor}; margin: 15px 0 10px 0; font-size: 20px; font-weight: 600; }
    p { line-height: 1.8; margin: 15px 0; color: #333; }
    .button { display: inline-block; padding: 14px 32px; background-color: ${primaryColor}; color: #ffffff !important; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; font-size: 16px; text-align: center; }
    .divider { height: 1px; background: linear-gradient(to right, transparent, #e5e5e5, transparent); margin: 30px 0; border: none; }
    .product { border: 2px solid #f0f0f0; padding: 25px; margin: 25px 0; border-radius: 12px; background: #fafafa; }
    .product img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    @media (max-width: 600px) {
      .content { padding: 20px; }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      .header { padding: 20px 15px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header">
        <img src="${logoUrl}" alt="Idylle" />
      </div>
      <div class="content">
`;

  design.blocks.forEach(block => {
    switch (block.type) {
      case 'heading':
        const level = block.data.level || 1;
        html += `<h${level}>${escapeHtml(block.data.text || '')}</h${level}>`;
        break;
      case 'text':
        html += `<div>${block.data.content || ''}</div>`;
        break;
      case 'image':
        if (block.data.url) {
          // Пропускаем логотип, он уже в header
          if (block.data.url && block.data.url.includes('logo')) {
            break;
          }
          // Для hero-изображений (большие изображения) делаем на всю ширину
          if (block.data.url && (block.data.url.includes('unsplash') || block.data.url.includes('hero') || block.data.url.includes('paris'))) {
            html += `<div style="margin: -30px -30px 30px -30px;"><img src="${block.data.url}" alt="${escapeHtml(block.data.alt || '')}" style="width: 100%; max-width: 100%; height: auto; display: block; object-fit: cover;" /></div>`;
          } else {
            html += `<div style="text-align: ${block.data.alignment || 'center'}; margin: 20px 0;"><img src="${block.data.url}" alt="${escapeHtml(block.data.alt || '')}" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`;
          }
        }
        break;
      case 'divider':
        html += '<hr class="divider" />';
        break;
      case 'button':
        const buttonUrl = block.data.url || '#';
        const buttonText = escapeHtml(block.data.text || 'Кнопка');
        html += `<div style="text-align: center; margin: 25px 0;"><a href="${buttonUrl}" class="button">${buttonText}</a></div>`;
        break;
      case 'product':
        if (block.data.productId && block.data.productName) {
          const productImage = block.data.productImageUrl || `${baseUrl}/placeholder.jpg`;
          const productName = block.data.customTitle || block.data.productName || 'Товар';
          const productSlug = block.data.productSlug || '#';
          const productPrice = block.data.productPrice;
          
          html += `<div class="product">
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <a href="${baseUrl}/catalog/${productSlug}" style="display: block; text-decoration: none; color: inherit; width: 100%;">
                <img src="${productImage}" alt="${escapeHtml(productName)}" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
                <h3 style="margin: 0 0 15px 0; font-size: 24px;">${escapeHtml(productName)}</h3>
              </a>
              ${block.data.showPrice !== false && productPrice ? `<p style="font-size: 28px; font-weight: 700; color: ${primaryColor}; margin: 15px 0;"><strong>${Number(productPrice).toLocaleString('ru-RU')} ₽</strong></p>` : ''}
              ${block.data.description ? `<p style="margin: 15px 0; line-height: 1.8; color: #555; font-size: 16px;">${escapeHtml(block.data.description)}</p>` : ''}
              <a href="${baseUrl}/catalog/${productSlug}" class="button" style="margin-top: 20px;">Подробнее</a>
            </div>
          </div>`;
        } else {
          html += `<div style="border: 1px solid #e5e5e5; padding: 20px; margin: 10px 0; text-align: center; color: #999;">
            Товар не выбран
          </div>`;
        }
        break;
      case 'product-grid':
        const products = block.data.products || [];
        const columns = block.data.columns || 3;
        if (products.length > 0) {
          html += `<div style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; margin: 20px 0;">
            <style>
              @media (max-width: 600px) {
                .product-grid { grid-template-columns: 1fr !important; }
              }
            </style>`;
          for (const product of products) {
            const prodImage = product.productImageUrl || product.imageUrl || `${baseUrl}/placeholder.jpg`;
            const prodName = product.customTitle || product.productName || product.title || '';
            const prodSlug = product.productSlug || product.slug || '#';
            const prodPrice = product.productPrice || product.price;
            
            html += `<div style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background: #fafafa;">
              <a href="${baseUrl}/catalog/${prodSlug}" style="display: block; text-decoration: none; color: inherit;">
                <img src="${prodImage}" alt="${escapeHtml(prodName)}" style="width: 100%; height: auto; display: block; object-fit: cover;" />
                <div style="padding: 15px;">
                  <h4 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; line-height: 1.4;">${escapeHtml(prodName)}</h4>
                  ${product.showPrice !== false && prodPrice ? `<p style="font-size: 18px; font-weight: 700; color: ${primaryColor}; margin: 10px 0;"><strong>${Number(prodPrice).toLocaleString('ru-RU')} ₽</strong></p>` : ''}
                  <span style="display: inline-block; margin-top: 10px; color: ${primaryColor}; text-decoration: underline; font-size: 14px;">Подробнее</span>
                </div>
              </a>
            </div>`;
          }
          html += '</div>';
        } else {
          html += `<div style="padding: 20px; text-align: center; color: #999; border: 1px dashed #e5e5e5; border-radius: 8px; margin: 20px 0;">
            Товары не выбраны
          </div>`;
        }
        break;
    }
  });

  html += `
      </div>
      <div style="padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; margin-top: 30px;">
        <p>Это маркетинговое письмо от Idylle</p>
        <p><a href="${baseUrl}/email/unsubscribe?token=UNSUBSCRIBE_TOKEN" style="color: #666;">Отписаться от рассылки</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
