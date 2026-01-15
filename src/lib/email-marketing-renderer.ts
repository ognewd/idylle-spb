import { sendMail } from './mail';

// Типы для блоков конструктора
export interface EmailBlock {
  id: string;
  type: 'heading' | 'text' | 'button' | 'image' | 'divider' | 'product' | 'product-grid' | 'links';
  data: any;
}

export interface EmailDesign {
  blocks: EmailBlock[];
  settings?: {
    backgroundColor?: string;
    fontFamily?: string;
    primaryColor?: string;
  };
}

// Временная функция рендеринга (базовая версия)
export async function renderMarketingEmail(designJson: any): Promise<string> {
  const design: EmailDesign = typeof designJson === 'string' 
    ? JSON.parse(designJson) 
    : designJson;

  if (!design || !design.blocks) {
    return '<html><body><p>Пустой шаблон</p></body></html>';
  }

  // Определяем baseUrl для абсолютных ссылок в email
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://aromarussia.ru' 
      : 'http://localhost:3000');
  const backgroundColor = design.settings?.backgroundColor || '#f5f5f5';
  const primaryColor = design.settings?.primaryColor || '#000000';
  const logoUrl = `${baseUrl}/logo-idylle.png`;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${design.settings?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'}; }
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
    .button:hover { background-color: ${primaryColor}dd; }
    .divider { height: 1px; background: linear-gradient(to right, transparent, #e5e5e5, transparent); margin: 30px 0; border: none; }
    .product { border: 2px solid #f0f0f0; padding: 25px; margin: 25px 0; border-radius: 12px; background: #fafafa; }
    .product img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    @media (max-width: 600px) {
      .product-grid { grid-template-columns: 1fr; }
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

  // Рендерим блоки (пропускаем логотип, т.к. он уже в header)
  for (const block of design.blocks) {
    // Пропускаем блок изображения, если это логотип (он уже в header)
    if (block.type === 'image' && block.data.url && block.data.url.includes('logo')) {
      continue;
    }
    html += renderBlock(block, baseUrl, primaryColor);
  }

  html += `
      </div>
      <div style="padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5;">
        <p>Это маркетинговое письмо от Idylle</p>
        <p><a href="${baseUrl}/email/unsubscribe?token=UNSUBSCRIBE_TOKEN" style="color: #666;">Отписаться от рассылки</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

function renderBlock(block: EmailBlock, baseUrl: string, primaryColor: string): string {
  switch (block.type) {
    case 'heading':
      const level = block.data.level || 1;
      const text = escapeHtml(block.data.text || '');
      return `<h${level}>${text}</h${level}>`;
    
    case 'text':
      return `<div>${block.data.content || ''}</div>`;
    
    case 'button':
      const buttonUrl = block.data.url || '#';
      const buttonText = escapeHtml(block.data.text || 'Кнопка');
      return `<div style="text-align: center; margin: 25px 0;"><a href="${buttonUrl}" class="button">${buttonText}</a></div>`;
    
    case 'image':
      const imageUrl = block.data.url || '';
      const imageAlt = escapeHtml(block.data.alt || '');
      // Для hero-изображений (большие изображения) делаем на всю ширину с отрицательными отступами
      if (imageUrl && (imageUrl.includes('unsplash') || imageUrl.includes('hero') || imageUrl.includes('paris'))) {
        return `<div style="margin: -30px -30px 30px -30px;"><img src="${imageUrl}" alt="${imageAlt}" style="width: 100%; max-width: 100%; height: auto; display: block; object-fit: cover;" /></div>`;
      }
      return `<div style="text-align: ${block.data.alignment || 'center'}; margin: 20px 0;"><img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`;
    
    case 'divider':
      return `<hr class="divider" />`;
    
    case 'product':
      const productImage = block.data.productImageUrl || block.data.imageUrl || `${baseUrl}/placeholder.jpg`;
      const productName = block.data.customTitle || block.data.productName || block.data.title || 'Товар';
      const productSlug = block.data.productSlug || block.data.slug || '#';
      const productPrice = block.data.productPrice || block.data.price;
      
      return `<div class="product">
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
    
    case 'product-grid':
      const columns = block.data.columns || 3;
      const gridProducts = block.data.products || [];
      let gridHtml = `<div class="product-grid" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; margin: 20px 0;">`;
      
      for (const product of gridProducts) {
        const prodImage = product.productImageUrl || product.imageUrl || `${baseUrl}/placeholder.jpg`;
        const prodName = product.customTitle || product.productName || product.title || '';
        const prodSlug = product.productSlug || product.slug || '#';
        const prodPrice = product.productPrice || product.price;
        
        gridHtml += `<div class="product" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
          <a href="${baseUrl}/catalog/${prodSlug}" style="display: block; text-decoration: none; color: inherit;">
            <img src="${prodImage}" alt="${escapeHtml(prodName)}" style="width: 100%; height: auto; display: block;" />
            <div style="padding: 15px;">
              <h4 style="margin: 0 0 10px 0; font-size: 16px;">${escapeHtml(prodName)}</h4>
              ${product.showPrice !== false && prodPrice ? `<p style="font-size: 18px; font-weight: 600; color: ${primaryColor}; margin: 10px 0;"><strong>${Number(prodPrice).toLocaleString('ru-RU')} ₽</strong></p>` : ''}
              <a href="${baseUrl}/catalog/${prodSlug}" style="display: inline-block; margin-top: 10px; color: ${primaryColor}; text-decoration: underline;">Подробнее</a>
            </div>
          </a>
        </div>`;
      }
      gridHtml += '</div>';
      return gridHtml;
    
    default:
      return '';
  }
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

// Отправка тестового письма
export async function sendTestMarketingEmail({
  to,
  subject,
  designJson,
}: {
  to: string;
  subject: string;
  designJson: any;
}) {
  const html = await renderMarketingEmail(designJson);
  
  await sendMail({
    to,
    subject,
    html,
  });
}
