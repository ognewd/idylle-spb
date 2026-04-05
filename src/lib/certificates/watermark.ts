import { readFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

const LOGO_REL = ['logo-idylle.png', 'logo.png'];

async function loadLogoBuffer(): Promise<Buffer | null> {
  const publicDir = join(process.cwd(), 'public');
  for (const name of LOGO_REL) {
    try {
      return await readFile(join(publicDir, name));
    } catch {
      /* next */
    }
  }
  return null;
}

async function fadeLogoPng(logoBuffer: Buffer, targetWidth: number): Promise<Buffer> {
  const resized = sharp(logoBuffer)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .ensureAlpha()
    .png();
  const { data, info } = await resized.raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  const mult = 0.38;
  for (let i = 3; i < buf.length; i += 4) {
    buf[i] = Math.max(0, Math.min(255, Math.floor(buf[i] * mult)));
  }
  return sharp(buf, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

export async function watermarkRasterImage(buffer: Buffer, mime: string): Promise<Buffer> {
  const logoFile = await loadLogoBuffer();
  if (!logoFile) return buffer;

  const baseMeta = await sharp(buffer).metadata();
  const iw = baseMeta.width || 800;
  const ih = baseMeta.height || 600;
  const targetW = Math.max(64, Math.round(Math.min(iw, ih) * 0.3));
  const overlay = await fadeLogoPng(logoFile, targetW);
  const om = await sharp(overlay).metadata();
  const lw = om.width || 1;
  const lh = om.height || 1;
  const left = Math.max(0, Math.floor((iw - lw) / 2));
  const top = Math.max(0, Math.floor((ih - lh) / 2));

  const pipeline = sharp(buffer).composite([{ input: overlay, left, top }]);

  if (mime === 'image/jpeg') {
    return pipeline.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  }
  if (mime === 'image/webp') {
    return pipeline.webp({ quality: 90 }).toBuffer();
  }
  return pipeline.png().toBuffer();
}

export async function watermarkPdf(buffer: Buffer): Promise<Buffer> {
  const logoFile = await loadLogoBuffer();
  if (!logoFile) return buffer;

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch {
    return buffer;
  }

  const logoPng = await sharp(logoFile).png().toBuffer();
  let logoImage;
  try {
    logoImage = await doc.embedPng(logoPng);
  } catch {
    return buffer;
  }

  const pages = doc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const logoW = Math.min(width, height) * 0.36;
    const scale = logoW / logoImage.width;
    const logoH = logoImage.height * scale;
    page.drawImage(logoImage, {
      x: (width - logoW) / 2,
      y: (height - logoH) / 2,
      width: logoW,
      height: logoH,
      opacity: 0.38,
    });
  }

  const out = await doc.save();
  return Buffer.from(out);
}
