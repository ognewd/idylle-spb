import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Проверяем, что сообщение принадлежит текущему пользователю
    const message = await prisma.taskMessage.findUnique({
      where: { id: params.messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message: messageText, fileUrl, fileName } = body;

    const updatedMessage = await prisma.taskMessage.update({
      where: { id: params.messageId },
      data: {
        message: messageText !== undefined ? (messageText?.trim() || null) : message.message,
        fileUrl: fileUrl !== undefined ? (fileUrl || null) : message.fileUrl,
        fileName: fileName !== undefined ? (fileName || null) : message.fileName,
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
      where: { id: message.taskId },
      data: { updatedAt: new Date() },
    });

    const response = NextResponse.json(updatedMessage, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    return response;
  } catch (error) {
    console.error('Update task message error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);

    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Проверяем, что сообщение принадлежит текущему пользователю
    const message = await prisma.taskMessage.findUnique({
      where: { id: params.messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (message.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }

    await prisma.taskMessage.delete({
      where: { id: params.messageId },
    });

    // Обновляем updatedAt задачи
    await prisma.task.update({
      where: { id: message.taskId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete task message error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

