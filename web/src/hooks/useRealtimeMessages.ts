'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { messagesApi } from '@/lib/api';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  readAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Conversation {
  id: string;
  participants: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      headline?: string;
    };
  }>;
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

interface TypingUser {
  conversationId: string;
  userId: string;
}

export function useRealtimeMessages(activeConversationId?: string) {
  const {
    onNewMessage,
    onTyping,
    onMessageRead,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessageAsRead,
    isConnected,
  } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const response = await messagesApi.getConversations();
    if (response.data) {
      setConversations(response.data.conversations || []);
    }
    setLoading(false);
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string, cursor?: string) => {
    const response = await messagesApi.getMessages(conversationId, cursor);
    if (response.data) {
      if (cursor) {
        setMessages((prev) => [...prev, ...(response.data!.messages || [])]);
      } else {
        setMessages(response.data.messages || []);
      }
      return response.data.nextCursor;
    }
    return null;
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const response = await messagesApi.getUnreadCount();
    if (response.data) {
      setUnreadCount(response.data.count);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    const response = await messagesApi.send(receiverId, content);
    if (response.data) {
      setMessages((prev) => [response.data!, ...prev]);
      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === response.data!.conversationId) {
            return { ...conv, lastMessage: response.data! };
          }
          return conv;
        })
      );
    }
    return response;
  }, []);

  // Handle typing indicators
  const handleStartTyping = useCallback(
    (conversationId: string, receiverId: string) => {
      startTyping(conversationId, receiverId);
    },
    [startTyping]
  );

  const handleStopTyping = useCallback(
    (conversationId: string, receiverId: string) => {
      stopTyping(conversationId, receiverId);
    },
    [stopTyping]
  );

  // Initial fetch
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  // Join/leave active conversation
  useEffect(() => {
    if (!isConnected || !activeConversationId) return;

    joinConversation(activeConversationId);
    fetchMessages(activeConversationId);

    return () => {
      leaveConversation(activeConversationId);
    };
  }, [isConnected, activeConversationId, joinConversation, leaveConversation, fetchMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onNewMessage((message) => {
      // Add message if it's from the active conversation
      if (message.conversationId === activeConversationId) {
        setMessages((prev) => [message, ...prev]);
      }

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: (conv.unreadCount || 0) + 1,
            };
          }
          return conv;
        })
      );

      // Update global unread count
      setUnreadCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, [isConnected, activeConversationId, onNewMessage]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onTyping((data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === data.userId && u.conversationId === data.conversationId)) {
            return prev;
          }
          return [...prev, { conversationId: data.conversationId, userId: data.userId }];
        });

        // Auto-remove typing indicator after 3 seconds
        const timeoutKey = `${data.conversationId}-${data.userId}`;
        const existingTimeout = typingTimeoutRef.current.get(timeoutKey);
        if (existingTimeout) clearTimeout(existingTimeout);

        const timeout = setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((u) => !(u.userId === data.userId && u.conversationId === data.conversationId))
          );
          typingTimeoutRef.current.delete(timeoutKey);
        }, 3000);

        typingTimeoutRef.current.set(timeoutKey, timeout);
      } else {
        setTypingUsers((prev) =>
          prev.filter((u) => !(u.userId === data.userId && u.conversationId === data.conversationId))
        );
      }
    });

    return unsubscribe;
  }, [isConnected, onTyping]);

  // Subscribe to message read receipts
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onMessageRead((data) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.messageId ? { ...msg, readAt: data.readAt } : msg))
      );
    });

    return unsubscribe;
  }, [isConnected, onMessageRead]);

  // Cleanup typing timeouts
  useEffect(() => {
    return () => {
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    conversations,
    messages,
    typingUsers,
    unreadCount,
    loading,
    sendMessage,
    fetchMessages,
    fetchConversations,
    handleStartTyping,
    handleStopTyping,
    markMessageAsRead,
  };
}
