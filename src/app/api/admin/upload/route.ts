import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  // Проверяем, используется ли Supabase Storage
  const useSupabaseStorage = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Если на Vercel и не настроен Supabase Storage, возвращаем ошибку
  if (process.env.VERCEL === '1' && !useSupabaseStorage) {
    return NextResponse.json(
      { error: 'Загрузка файлов через файловую систему не поддерживается на Vercel. Настройте Supabase Storage или другое облачное хранилище.' },
      { status: 501 }
    );
  }
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;

    let url: string;

    if (useSupabaseStorage) {
      // Загрузка в Supabase Storage
      try {
        const supabase = createSupabaseAdminClient();
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { data, error } = await supabase.storage
          .from('products') // Название bucket в Supabase Storage
          .upload(`products/${filename}`, buffer, {
            contentType: file.type,
            upsert: false, // Не перезаписывать существующие файлы
          });

        if (error) {
          console.error('Supabase Storage upload error:', error);
          return NextResponse.json(
            { error: `Ошибка загрузки в Supabase Storage: ${error.message}` },
            { status: 500 }
          );
        }

        // Получаем публичный URL файла
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(`products/${filename}`);

        url = urlData.publicUrl;
      } catch (supabaseError) {
        console.error('Supabase Storage error:', supabaseError);
        return NextResponse.json(
          { error: 'Ошибка при работе с Supabase Storage' },
          { status: 500 }
        );
      }
    } else {
      // Локальная загрузка (только для development)
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const filePath = join(uploadsDir, filename);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      url = `/uploads/products/${filename}`;
    }
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


