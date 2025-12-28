"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Card } from "@/components/ui";
import {
  Search,
  Send,
  MoreHorizontal,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Paperclip,
  Loader2,
  MessageCircle,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { messagesApi } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface Participant {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    headline?: string;
    avatarUrl?: string;
  };
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
}

interface Message {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId?: string;
  readAt?: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            <Card className="h-[calc(100vh-120px)] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    }>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user } = useAuth();
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    onNewMessage,
    onTyping,
    onMessageRead,
    markMessageAsRead,
  } = useSocket();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingRef = useRef<number>(0);

  // Get the other user from a conversation
  const getOtherUser = useCallback((conv: Conversation) => {
    const otherParticipant = conv.participants?.find(p => p.user.id !== user?.id);
    return otherParticipant?.user || {
      id: '',
      firstName: 'Utilisateur',
      lastName: 'Inconnu',
    };
  }, [user?.id]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    const result = await messagesApi.getConversations();
    if (result.data) {
      setConversations((result.data as any).conversations || []);
    }
    setIsLoadingConversations(false);
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    const result = await messagesApi.getMessages(conversationId);
    if (result.data) {
      setMessages((result.data as any).messages || []);
    }
    setIsLoadingMessages(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Check if there's a user param to start a new conversation
  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId) {
      // Could fetch user info and start new conversation
    }
  }, [searchParams]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join/leave conversation on selection
  useEffect(() => {
    if (!isConnected || !selectedConversation) return;

    joinConversation(selectedConversation.id);

    return () => {
      leaveConversation(selectedConversation.id);
    };
  }, [isConnected, selectedConversation, joinConversation, leaveConversation]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onNewMessage((message: Message) => {
      // Add message to list if it's from the active conversation
      if (message.conversationId === selectedConversation?.id) {
        setMessages(prev => [...prev, message]);

        // Mark as read if we're viewing the conversation
        if (message.senderId !== user?.id) {
          markMessageAsRead(message.id, message.conversationId);
        }
      }

      // Update conversation list
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt,
                senderId: message.senderId,
              },
              unreadCount: message.conversationId === selectedConversation?.id
                ? 0
                : (conv.unreadCount || 0) + 1,
            };
          }
          return conv;
        })
      );
    });

    return unsubscribe;
  }, [isConnected, selectedConversation, user?.id, onNewMessage, markMessageAsRead]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onTyping((data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === selectedConversation?.id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (data.isTyping) {
            newMap.set(data.userId, true);
          } else {
            newMap.delete(data.userId);
          }
          return newMap;
        });
      }
    });

    return unsubscribe;
  }, [isConnected, selectedConversation, onTyping]);

  // Subscribe to message read receipts
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onMessageRead((data: { messageId: string; readAt: string }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId ? { ...msg, readAt: data.readAt } : msg
        )
      );
    });

    return unsubscribe;
  }, [isConnected, onMessageRead]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    setShowMobileChat(true);

    // Clear unread count
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const otherUser = getOtherUser(selectedConversation);

    setIsSending(true);
    const result = await messagesApi.send(otherUser.id, newMessage.trim());

    if (!result.error && result.data) {
      setMessages(prev => [...prev, result.data as Message]);
      setNewMessage("");

      // Update last message in conversation list
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: {
                  content: newMessage.trim(),
                  createdAt: new Date().toISOString(),
                  senderId: user?.id || "",
                },
              }
            : conv
        )
      );

      // Stop typing indicator
      stopTyping(selectedConversation.id, otherUser.id);
    }
    setIsSending(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!selectedConversation || !isConnected) return;

    const otherUser = getOtherUser(selectedConversation);
    const now = Date.now();

    // Only send typing indicator if we haven't sent one recently
    if (now - lastTypingRef.current > 2000) {
      startTyping(selectedConversation.id, otherUser.id);
      lastTypingRef.current = now;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversation.id, otherUser.id);
    }, 3000);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    const name = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const isOtherUserTyping = typingUsers.size > 0 &&
    selectedConversation &&
    !typingUsers.has(user?.id || '');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-6">
          <Card padding="none" className="overflow-hidden">
            <div className="flex h-[calc(100vh-180px)]">
              {/* Conversations List */}
              <div
                className={`w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col ${
                  showMobileChat ? "hidden md:flex" : "flex"
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-neutral-900">Messages</h1>
                    {isConnected && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        En ligne
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full pl-9 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                  {isLoadingConversations ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <MessageCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-500">Aucune conversation</p>
                    </div>
                  ) : (
                    filteredConversations.map(conv => {
                      const otherUser = getOtherUser(conv);
                      return (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors ${
                            selectedConversation?.id === conv.id ? "bg-primary-50" : ""
                          }`}
                        >
                          <div className="relative">
                            <Avatar
                              name={`${otherUser.firstName} ${otherUser.lastName}`}
                              src={otherUser.avatarUrl}
                              size="md"
                            />
                            {(conv.unreadCount || 0) > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-neutral-900 truncate">
                                {otherUser.firstName} {otherUser.lastName}
                              </p>
                              {conv.lastMessage && (
                                <span className="text-xs text-neutral-400">
                                  {formatDistanceToNow(new Date(conv.lastMessage.createdAt))}
                                </span>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p
                                className={`text-sm truncate ${
                                  (conv.unreadCount || 0) > 0 ? "text-neutral-900 font-medium" : "text-neutral-500"
                                }`}
                              >
                                {conv.lastMessage.senderId === user?.id && "Vous : "}
                                {conv.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div
                className={`flex-1 flex flex-col ${
                  showMobileChat ? "flex" : "hidden md:flex"
                }`}
              >
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-neutral-200">
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <Avatar
                        name={`${getOtherUser(selectedConversation).firstName} ${getOtherUser(selectedConversation).lastName}`}
                        src={getOtherUser(selectedConversation).avatarUrl}
                        size="md"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">
                          {getOtherUser(selectedConversation).firstName}{" "}
                          {getOtherUser(selectedConversation).lastName}
                        </p>
                        {isOtherUserTyping ? (
                          <p className="text-sm text-primary-500 animate-pulse">
                            est en train d&apos;écrire...
                          </p>
                        ) : (
                          <p className="text-sm text-neutral-500">
                            {getOtherUser(selectedConversation).headline || "Membre ProNet"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Phone className="h-5 w-5 text-neutral-500" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Video className="h-5 w-5 text-neutral-500" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <MoreHorizontal className="h-5 w-5 text-neutral-500" />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {isLoadingMessages ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-neutral-500">
                            Commencez la conversation avec{" "}
                            {getOtherUser(selectedConversation).firstName}
                          </p>
                        </div>
                      ) : (
                        messages.map(message => {
                          const isOwn = message.senderId === user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`flex gap-2 max-w-[70%] ${
                                  isOwn ? "flex-row-reverse" : ""
                                }`}
                              >
                                {!isOwn && message.sender && (
                                  <Avatar
                                    name={`${message.sender.firstName} ${message.sender.lastName}`}
                                    src={message.sender.avatarUrl}
                                    size="sm"
                                    className="flex-shrink-0"
                                  />
                                )}
                                <div>
                                  <div
                                    className={`px-4 py-2 rounded-2xl ${
                                      isOwn
                                        ? "bg-primary-500 text-white rounded-br-md"
                                        : "bg-neutral-100 text-neutral-900 rounded-bl-md"
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                  <div
                                    className={`flex items-center gap-1 mt-1 ${
                                      isOwn ? "justify-end" : ""
                                    }`}
                                  >
                                    <p className="text-xs text-neutral-400">
                                      {formatDistanceToNow(new Date(message.createdAt))}
                                    </p>
                                    {isOwn && (
                                      message.readAt ? (
                                        <CheckCheck className="h-3 w-3 text-primary-500" />
                                      ) : (
                                        <Check className="h-3 w-3 text-neutral-400" />
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-4 border-t border-neutral-200"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Paperclip className="h-5 w-5 text-neutral-500" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <ImageIcon className="h-5 w-5 text-neutral-500" />
                        </button>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={handleInputChange}
                            placeholder="Écrivez un message..."
                            className="w-full px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <Smile className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                          </button>
                        </div>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newMessage.trim() || isSending}
                          className="rounded-full"
                        >
                          {isSending ? (
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
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                        Vos messages
                      </h3>
                      <p className="text-neutral-500">
                        Sélectionnez une conversation pour voir les messages
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
