import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const messages = await prisma.taskMessage.findMany({
      where: { taskId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const response = NextResponse.json(messages, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    return response;
  } catch (error) {
    console.error('Get task messages error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Проверяем, существует ли задача
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Проверяем, это FormData (с файлом) или JSON
    const contentType = request.headers.get('content-type') || '';
    let message = '';
    let fileUrl = null;
    let fileName = null;

    if (contentType.includes('multipart/form-data')) {
      // Обработка FormData с файлом
      const formData = await request.formData();
      message = (formData.get('message') as string) || '';
      const file = formData.get('file') as File | null;

      if ((!message || !message.trim()) && !file) {
        return NextResponse.json(
          { error: 'Message or file is required' },
          { status: 400 }
        );
      }

      // Если есть файл, загружаем его
      if (file) {
        const { writeFile, mkdir } = await import('fs/promises');
        const { join } = await import('path');
        const { existsSync } = await import('fs');

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('application/')) {
          return NextResponse.json(
            { error: 'File must be an image or document' },
            { status: 400 }
          );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size must be less than 10MB' },
            { status: 400 }
          );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop() || 'bin';
        const filename = `${timestamp}-${randomString}.${extension}`;

        // Use UPLOADS_DIR from environment if set (for production), otherwise use public/uploads
        const baseUploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads');
        const uploadsDir = join(baseUploadsDir, 'tasks');

        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Save file
        const filePath = join(uploadsDir, filename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        fileUrl = `/uploads/tasks/${filename}`;
        fileName = file.name;
      }
    } else {
      // Обработка JSON
      const body = await request.json();
      message = body.message || '';
      fileUrl = body.fileUrl || null;
      fileName = body.fileName || null;
    }

    if (!message?.trim() && !fileUrl) {
      return NextResponse.json(
        { error: 'Message or file is required' },
        { status: 400 }
      );
    }

    const taskMessage = await prisma.taskMessage.create({
      data: {
        taskId: params.id,
        userId: authResult.user.id,
        message: message?.trim() || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Обновляем updatedAt задачи
    await prisma.task.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    const response = NextResponse.json(taskMessage, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    return response;
  } catch (error) {
    console.error('Create task message error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

