"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Card, Input } from "@/components/ui";
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
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { messagesApi } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    headline?: string;
    avatarUrl?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Check if there's a user param to start a new conversation
    const userId = searchParams.get("user");
    if (userId) {
      // Could fetch user info and start new conversation
    }
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    const result = await messagesApi.getConversations();
    if (result.data) {
      setConversations(result.data as Conversation[]);
    }
    setIsLoadingConversations(false);
  };

  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    const result = await messagesApi.getMessages(conversationId);
    if (result.data) {
      setMessages((result.data as any).messages || []);
    }
    setIsLoadingMessages(false);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    setShowMobileChat(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    const result = await messagesApi.send(selectedConversation.otherUser.id, newMessage.trim());

    if (!result.error && result.data) {
      setMessages((prev) => [...prev, result.data as Message]);
      setNewMessage("");
      
      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((conv) =>
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
    }
    setIsSending(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = `${conv.otherUser.firstName} ${conv.otherUser.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const userName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur";

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
                  <h1 className="text-xl font-bold text-neutral-900 mb-4">Messages</h1>
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
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors ${
                          selectedConversation?.id === conv.id ? "bg-primary-50" : ""
                        }`}
                      >
                        <div className="relative">
                          <Avatar
                            name={`${conv.otherUser.firstName} ${conv.otherUser.lastName}`}
                            src={conv.otherUser.avatarUrl}
                            size="md"
                          />
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-neutral-900 truncate">
                              {conv.otherUser.firstName} {conv.otherUser.lastName}
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
                                conv.unreadCount > 0 ? "text-neutral-900 font-medium" : "text-neutral-500"
                              }`}
                            >
                              {conv.lastMessage.senderId === user?.id && "Vous : "}
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
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
                        name={`${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName}`}
                        src={selectedConversation.otherUser.avatarUrl}
                        size="md"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">
                          {selectedConversation.otherUser.firstName}{" "}
                          {selectedConversation.otherUser.lastName}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {selectedConversation.otherUser.headline || "Membre ProNet"}
                        </p>
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
                            {selectedConversation.otherUser.firstName}
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => {
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
                                {!isOwn && (
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
                                  <p
                                    className={`text-xs text-neutral-400 mt-1 ${
                                      isOwn ? "text-right" : ""
                                    }`}
                                  >
                                    {formatDistanceToNow(new Date(message.createdAt))}
                                  </p>
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
                            onChange={(e) => setNewMessage(e.target.value)}
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
