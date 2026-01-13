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

    // Проверяем доступность модели Task
    if (!('task' in prisma)) {
      console.error('Task model not found in Prisma Client. Run: npx prisma generate && npx prisma db push');
      return NextResponse.json(
        { 
          error: 'Task model not available', 
          details: 'Please run: npx prisma generate && npx prisma db push' 
        },
        { status: 500 }
      );
    }

    const tasks = await (prisma as any).task.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
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
    const { title, description, priority, fileUrl, fileName } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

      const task = await (prisma as any).task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'normal',
        status: 'new',
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        createdById: authResult.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
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

