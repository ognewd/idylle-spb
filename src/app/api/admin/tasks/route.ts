import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)));
    const status = searchParams.get('status') || 'all';
    const assigneeIdsRaw = searchParams.get('assigneeIds') || '';

    const where: Record<string, unknown> = {};
    if (status !== 'all') {
      where.status = status;
    }
    if (assigneeIdsRaw.trim()) {
      const ids = assigneeIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        const hasUnassigned = ids.includes('__unassigned__');
        const userIds = ids.filter((id) => id !== '__unassigned__');
        if (hasUnassigned && userIds.length === 0) {
          where.assignedToId = null;
        } else if (hasUnassigned && userIds.length > 0) {
          where.OR = [
            { assignedToId: null },
            { assignedToId: { in: userIds } },
          ];
        } else {
          where.assignedToId = { in: userIds };
        }
      }
    }

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
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
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Задачи со статусом "Готово" — в конец списка
    const sortedTasks =
      tasks.length > 0
        ? [...tasks].sort((a, b) => {
            if (a.status === 'done' && b.status !== 'done') return 1;
            if (a.status !== 'done' && b.status === 'done') return -1;
            return 0;
          })
        : tasks;

    const totalPages = Math.max(1, Math.ceil(total / limit));

    type Assignee = { id: string; name: string };
    let assignees: Assignee[] = [];
    if (page === 1) {
      const grouped = await prisma.task.groupBy({
        by: ['assignedToId'],
      });
      const uniqueIds = grouped.map((g) => g.assignedToId).filter((id): id is string => id != null);
      const users =
        uniqueIds.length > 0
          ? await prisma.user.findMany({
              where: { id: { in: uniqueIds } },
              select: { id: true, name: true, email: true },
            })
          : [];
      assignees = [
        { id: '__unassigned__', name: 'Не назначено' },
        ...users.map((u) => ({ id: u.id, name: u.name || u.email || u.id })),
      ].sort((a, b) => (a.id === '__unassigned__' ? 1 : 0) - (b.id === '__unassigned__' ? 1 : 0) || a.name.localeCompare(b.name));
    }

    const response = NextResponse.json(
      {
        tasks: sortedTasks,
        pagination: { page, limit, total, totalPages },
        assignees: page === 1 ? assignees : undefined,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
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

