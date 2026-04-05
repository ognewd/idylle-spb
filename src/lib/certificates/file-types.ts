/** Допустимые типы файлов для сертификатов */
export const CERTIFICATE_MAX_BYTES = 25 * 1024 * 1024;

const EXT_SET = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'xlsx',
  'xls',
  'doc',
  'docx',
]);

const MIME_NORMALIZE: Record<string, string> = {
  'image/jpg': 'image/jpeg',
};

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const EXT_DEFAULT_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function normalizeCertificateMime(mime: string, ext: string): string {
  const m = MIME_NORMALIZE[mime] || mime;
  if (ALLOWED_MIME.has(m)) return m;
  const fromExt = EXT_DEFAULT_MIME[ext.toLowerCase()];
  return fromExt || m;
}

export function isCertificateAllowed(mime: string, ext: string): boolean {
  const e = ext.toLowerCase().replace(/^\./, '');
  if (!EXT_SET.has(e)) return false;
  const m = normalizeCertificateMime(mime, e);
  return ALLOWED_MIME.has(m);
}

export function extFromFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() || '';
  const i = base.lastIndexOf('.');
  return i >= 0 ? base.slice(i + 1).toLowerCase() : '';
}

export function canApplyLogoWatermark(mime: string): 'image' | 'pdf' | null {
  if (mime === 'application/pdf') return 'pdf';
  if (
    mime === 'image/jpeg' ||
    mime === 'image/png' ||
    mime === 'image/webp'
  ) {
    return 'image';
  }
  return null;
}
