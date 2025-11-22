import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET messages for a chat session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST create new message
export async function POST(request: NextRequest) {
  try {
    const { chatId, sender, message } = await request.json();

    if (!chatId || !sender || !message) {
      return NextResponse.json(
        { error: 'chatId, sender, and message are required' },
        { status: 400 }
      );
    }

    // Create message
    const newMessage = await prisma.chatMessage.create({
      data: {
        chatId,
        sender,
        message,
        isRead: false,
      },
    });

    // Update chat session last message time
    await prisma.chatSession.update({
      where: { id: chatId },
      data: { lastMessage: new Date() },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

// PATCH mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const { chatId, sender } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      );
    }

    // Mark messages from the other sender as read
    await prisma.chatMessage.updateMany({
      where: {
        chatId,
        sender: { not: sender || 'admin' },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
