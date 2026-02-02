/**
 * Санитизация HTML перед выводом через dangerouslySetInnerHTML.
 * Защита от XSS при контенте из БД (описания товаров, страницы CMS, инструкции).
 */

import DOMPurify from 'isomorphic-dompurify';

/** Разрешённые теги и атрибуты по умолчанию DOMPurify (без script, iframe, on* и т.п.) */
const DEFAULT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'a', 'span', 'div', 'blockquote', 'pre', 'code', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'class', 'src', 'alt', 'width', 'height'],
  ADD_ATTR: ['target'], // для target="_blank" на ссылках
};

/**
 * Очищает HTML от опасных тегов и атрибутов (XSS).
 * Возвращает пустую строку для null/undefined.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (html == null || html === '') return '';
  return DOMPurify.sanitize(html, DEFAULT_CONFIG);
}
