'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, Loader2, User as UserIcon, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ChatSession {
  id: string;
  userName: string;
  userEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  sender: string;
  message: string;
  createdAt: string;
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    loadSessions();
    
    // Refresh sessions every 10 seconds
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession);
      markAsRead(selectedSession);
      
      // Refresh messages every 2 seconds
      const interval = setInterval(() => {
        loadMessages(selectedSession);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?chatId=${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (chatId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch('/api/chat/messages', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, sender: 'admin' }),
      });
      loadSessions(); // Refresh to update unread count
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedSession) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedSession,
          sender: 'admin',
          message: inputMessage,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setInputMessage('');
        loadSessions(); // Refresh to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот чат? Все сообщения будут удалены.')) {
      return;
    }

    setDeletingId(chatId);
    try {
      const response = await fetch(`/api/chat/sessions/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If we deleted the selected session, clear it
        if (selectedSession === chatId) {
          setSelectedSession(null);
          setMessages([]);
        }
        loadSessions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Ошибка при удалении чата');
    } finally {
      setDeletingId(null);
    }
  };

  const selectedSessionData = sessions.find(s => s.id === selectedSession);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          {/* Sessions List */}
          <div className="w-80 flex-shrink-0">
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Чат
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {sessions.length} {sessions.length === 1 ? 'диалог' : 'диалогов'}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {isLoadingSessions ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Нет активных диалогов
                  </div>
                ) : (
                  <div className="divide-y">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          selectedSession === session.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => setSelectedSession(session.id)}
                            className="flex-1 min-w-0 text-left"
                          >
                            <div className="font-semibold truncate">
                              {session.userName}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {session.userEmail}
                            </div>
                            {session.lastMessage && (
                              <div className="text-sm text-gray-400 mt-1 truncate">
                                {new Date(session.lastMessage).toLocaleString('ru-RU', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </button>
                          <div className="flex items-center gap-2">
                            {session.unreadCount > 0 && (
                              <Badge className="bg-primary text-primary-foreground">
                                {session.unreadCount}
                              </Badge>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(session.id);
                              }}
                              disabled={deletingId === session.id}
                              className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                              title="Удалить чат"
                            >
                              {deletingId === session.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="flex-1">
            <Card className="h-full flex flex-col">
              {selectedSession ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{selectedSessionData?.userName}</div>
                          <div className="text-sm text-gray-600">{selectedSessionData?.userEmail}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => selectedSessionData && deleteChat(selectedSessionData.id)}
                        disabled={deletingId === selectedSession}
                        className="p-2 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                        title="Удалить чат"
                      >
                        {deletingId === selectedSession ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.sender === 'user'
                              ? 'bg-gray-200'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          {msg.sender === 'user' && (
                            <div className="text-xs font-semibold mb-1 text-gray-600">
                              Пользователь
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Написать сообщение..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Выберите диалог</p>
                    <p className="text-sm mt-1">Выберите диалог из списка слева</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
