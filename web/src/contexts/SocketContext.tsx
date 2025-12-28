'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Notification {
  id?: string;
  type: string;
  title: string;
  content: string;
  link?: string;
  createdAt?: string;
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  // Messages
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string, receiverId: string) => void;
  stopTyping: (conversationId: string, receiverId: string) => void;
  markMessageAsRead: (messageId: string, conversationId: string) => void;
  // Event handlers
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onTyping: (callback: (data: TypingIndicator) => void) => () => void;
  onMessageRead: (callback: (data: { messageId: string; conversationId: string; readAt: string }) => void) => () => void;
  onNotification: (callback: (notification: Notification) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('user_online', (userId: string) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    newSocket.on('user_offline', (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  // Conversation methods
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join_conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave_conversation', conversationId);
  }, []);

  const startTyping = useCallback((conversationId: string, receiverId: string) => {
    socketRef.current?.emit('typing_start', { conversationId, receiverId });
  }, []);

  const stopTyping = useCallback((conversationId: string, receiverId: string) => {
    socketRef.current?.emit('typing_stop', { conversationId, receiverId });
  }, []);

  const markMessageAsRead = useCallback((messageId: string, conversationId: string) => {
    socketRef.current?.emit('message_read', { messageId, conversationId });
  }, []);

  // Event subscription handlers
  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    const handler = (message: Message) => callback(message);
    socketRef.current?.on('new_message', handler);
    return () => {
      socketRef.current?.off('new_message', handler);
    };
  }, []);

  const onTyping = useCallback((callback: (data: TypingIndicator) => void) => {
    const handler = (data: TypingIndicator) => callback(data);
    socketRef.current?.on('user_typing', handler);
    return () => {
      socketRef.current?.off('user_typing', handler);
    };
  }, []);

  const onMessageRead = useCallback((callback: (data: { messageId: string; conversationId: string; readAt: string }) => void) => {
    const handler = (data: { messageId: string; conversationId: string; readAt: string }) => callback(data);
    socketRef.current?.on('message_read_receipt', handler);
    return () => {
      socketRef.current?.off('message_read_receipt', handler);
    };
  }, []);

  const onNotification = useCallback((callback: (notification: Notification) => void) => {
    const handler = (notification: Notification) => callback(notification);
    socketRef.current?.on('notification', handler);
    return () => {
      socketRef.current?.off('notification', handler);
    };
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessageAsRead,
    onNewMessage,
    onTyping,
    onMessageRead,
    onNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
