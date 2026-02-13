import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const tasks = await prisma.task.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        files: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: [
        // Сначала задачи не в статусе "done"
        {
          status: 'asc',
        },
        // Затем по дате создания (новые сверху)
        {
          createdAt: 'desc',
        },
      ],
    });

    // Сортируем: сначала не "done", затем "done"
    const sortedTasks = tasks.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const response = NextResponse.json(sortedTasks, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    return response;
  } catch (error) {
    console.error('Tasks API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { title, description, priority, fileUrls, assignedToEmail } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Находим назначенного пользователя по email (по умолчанию ognewd@gmail.com)
    let assignedToId: string | null = null;
    const targetEmail = assignedToEmail || 'ognewd@gmail.com';
    const assignedUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: { id: true },
    });
    if (assignedUser) {
      assignedToId = assignedUser.id;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'normal',
        status: 'new',
        createdById: authResult.user.id,
        assignedToId,
        files: fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0
          ? {
              create: fileUrls.map((file: { url: string; fileName: string; fileType?: string; fileSize?: number }) => ({
                url: file.url,
                fileName: file.fileName,
                fileType: file.fileType || null,
                fileSize: file.fileSize || null,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        files: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    const response = NextResponse.json(task, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    return response;
  } catch (error) {
    console.error('Create task error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

