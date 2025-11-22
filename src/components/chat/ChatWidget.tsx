'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  sender: string;
  message: string;
  createdAt: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load saved user info from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('chat_userName');
      const savedEmail = localStorage.getItem('chat_userEmail');
      if (savedName) setUserName(savedName);
      if (savedEmail) setUserEmail(savedEmail);
    }
  }, []);

  // Load messages periodically when chat is open
  useEffect(() => {
    if (!isOpen || !chatId) return;

    // Load messages immediately
    loadMessages(chatId);

    // Then load every 2 seconds
    const interval = setInterval(() => {
      loadMessages(chatId);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, chatId]);

  // Get or create chat session
  const getOrCreateSession = async (name: string, email: string) => {
    try {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_userName', name);
        localStorage.setItem('chat_userEmail', email);
      }

      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: name, userEmail: email }),
      });

      const session = await response.json();
      setChatId(session.id);
      setShowRegistration(false);
      loadMessages(session.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Load messages
  const loadMessages = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/messages?chatId=${id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          sender: 'user',
          message: inputMessage,
        }),
      });

      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle start chat
  const handleStartChat = () => {
    if (userName && userEmail) {
      getOrCreateSession(userName, userEmail);
    } else {
      setShowRegistration(true);
    }
  };

  // Auto-start chat if we have saved credentials
  useEffect(() => {
    if (isOpen && userName && userEmail && !chatId && !showRegistration) {
      getOrCreateSession(userName, userEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userName, userEmail, chatId, showRegistration]);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 mx-auto" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] flex flex-col bg-white rounded-lg shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary/90 text-white rounded-t-lg">
            <div>
              <h3 className="font-semibold">Чат поддержки</h3>
              <p className="text-xs text-white/80">Мы онлайн и готовы помочь</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {!chatId && !showRegistration && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Добро пожаловать в чат поддержки!</p>
                <Button onClick={() => setShowRegistration(true)}>
                  Начать чат
                </Button>
              </div>
            )}

            {showRegistration && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Представьтесь, пожалуйста</h4>
                <div className="space-y-3">
                  <Input
                    placeholder="Ваше имя"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleStartChat}
                    disabled={!userName || !userEmail}
                    className="w-full"
                  >
                    Продолжить
                  </Button>
                </div>
              </Card>
            )}

            {chatId && messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {msg.sender === 'admin' && (
                    <div className="text-xs font-semibold mb-1 text-gray-600">
                      Администратор
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {chatId && (
            <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-lg">
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
          )}
        </div>
      )}
    </>
  );
}
