import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all chat sessions (for admin)
export async function GET(request: NextRequest) {
  try {
    const sessions = await prisma.chatSession.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Count unread messages for each session
    const sessionsWithUnread = await Promise.all(
      sessions.map(async (session) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            chatId: session.id,
            sender: 'user',
            isRead: false,
          },
        });

        return {
          ...session,
          unreadCount,
        };
      })
    );

    return NextResponse.json(sessionsWithUnread);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

// POST create new chat session (for user)
export async function POST(request: NextRequest) {
  try {
    const { userName, userEmail, userId } = await request.json();

    if (!userName || !userEmail) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if session already exists for this email
    let session = await prisma.chatSession.findFirst({
      where: {
        userEmail,
        isActive: true,
      },
    });

    // If no active session, create new one
    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userName,
          userEmail,
          userId: userId || null,
          isActive: true,
        },
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}
