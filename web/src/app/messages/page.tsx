"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Badge, Input } from "@/components/ui";
import {
  Search,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Circle,
  Archive,
  Trash2,
  Star,
  Filter,
} from "lucide-react";
import Link from "next/link";

const conversations = [
  {
    id: 1,
    user: {
      name: "Thomas Bernard",
      title: "Senior Developer @TechCorp",
      avatar: null,
      online: true,
    },
    lastMessage: {
      text: "Super, on se fait un call demain pour discuter du projet ?",
      time: "10:34",
      isMe: false,
      read: true,
    },
    unread: 0,
    starred: true,
  },
  {
    id: 2,
    user: {
      name: "Sophie Martin",
      title: "Product Manager @InnovateTech",
      avatar: null,
      online: false,
    },
    lastMessage: {
      text: "Merci pour le partage, très intéressant !",
      time: "Hier",
      isMe: true,
      read: true,
    },
    unread: 0,
    starred: false,
  },
  {
    id: 3,
    user: {
      name: "Léa Dubois",
      title: "UX Designer @DesignStudio",
      avatar: null,
      online: true,
    },
    lastMessage: {
      text: "J'ai regardé ton portfolio, vraiment impressionnant ! On pourrait collaborer sur un projet ?",
      time: "Hier",
      isMe: false,
      read: false,
    },
    unread: 2,
    starred: false,
  },
  {
    id: 4,
    user: {
      name: "Pierre Durand",
      title: "CTO @StartupXYZ",
      avatar: null,
      online: false,
    },
    lastMessage: {
      text: "Voici les détails de l'offre dont je t'ai parlé",
      time: "Lun",
      isMe: false,
      read: true,
    },
    unread: 0,
    starred: true,
  },
  {
    id: 5,
    user: {
      name: "Julie Chen",
      title: "Data Scientist @DataCorp",
      avatar: null,
      online: false,
    },
    lastMessage: {
      text: "Le meetup était génial, à refaire !",
      time: "23 déc",
      isMe: true,
      read: true,
    },
    unread: 0,
    starred: false,
  },
];

const messages = [
  {
    id: 1,
    senderId: "other",
    text: "Salut Marie ! J'espère que tu vas bien 👋",
    time: "10:00",
    read: true,
  },
  {
    id: 2,
    senderId: "other",
    text: "J'ai vu ton post sur React 19, vraiment cool ta contribution !",
    time: "10:01",
    read: true,
  },
  {
    id: 3,
    senderId: "me",
    text: "Hey Thomas ! Ça va super, merci 😊",
    time: "10:15",
    read: true,
  },
  {
    id: 4,
    senderId: "me",
    text: "Oui c'était une expérience incroyable de contribuer à React. L'équipe est vraiment accueillante !",
    time: "10:16",
    read: true,
  },
  {
    id: 5,
    senderId: "other",
    text: "Je me demandais si tu serais intéressée par un projet open-source sur lequel on travaille. C'est une lib de composants React accessible.",
    time: "10:20",
    read: true,
  },
  {
    id: 6,
    senderId: "me",
    text: "Ah oui ça m'intéresse beaucoup ! L'accessibilité c'est un sujet qui me tient à cœur",
    time: "10:25",
    read: true,
  },
  {
    id: 7,
    senderId: "other",
    text: "Super, on se fait un call demain pour discuter du projet ?",
    time: "10:34",
    read: true,
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");

  const filteredConversations = conversations.filter((conv) => {
    if (filter === "unread") return conv.unread > 0;
    if (filter === "starred") return conv.starred;
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-neutral-100">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar conversations */}
        <aside className="w-80 bg-white border-r border-neutral-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-neutral-900">Messages</h1>
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <MoreHorizontal className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2 mt-3">
              {[
                { key: "all", label: "Tous" },
                { key: "unread", label: "Non lus" },
                { key: "starred", label: "Favoris" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as typeof filter)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === f.key
                      ? "bg-primary-100 text-primary-700"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 flex gap-3 hover:bg-neutral-50 transition-colors text-left ${
                  selectedConversation?.id === conv.id ? "bg-primary-50" : ""
                }`}
              >
                <div className="relative">
                  <Avatar
                    name={conv.user.name}
                    size="md"
                    showStatus
                    status={conv.user.online ? "online" : "offline"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-neutral-900 truncate">
                        {conv.user.name}
                      </span>
                      {conv.starred && (
                        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                      )}
                    </div>
                    <span className="text-xs text-neutral-400">
                      {conv.lastMessage.time}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate mt-0.5 ${
                      conv.unread > 0
                        ? "text-neutral-900 font-medium"
                        : "text-neutral-500"
                    }`}
                  >
                    {conv.lastMessage.isMe && (
                      <span className="text-neutral-400">Vous : </span>
                    )}
                    {conv.lastMessage.text}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Zone de conversation */}
        <main className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Header conversation */}
              <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={selectedConversation.user.name}
                    size="md"
                    showStatus
                    status={selectedConversation.user.online ? "online" : "offline"}
                  />
                  <div>
                    <h2 className="font-semibold text-neutral-900">
                      {selectedConversation.user.name}
                    </h2>
                    <p className="text-sm text-neutral-500">
                      {selectedConversation.user.online
                        ? "En ligne"
                        : selectedConversation.user.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Phone className="h-5 w-5 text-neutral-500" />
                  </button>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Video className="h-5 w-5 text-neutral-500" />
                  </button>
                  <button
                    className={`p-2 hover:bg-neutral-100 rounded-lg transition-colors ${
                      selectedConversation.starred ? "text-accent-500" : ""
                    }`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        selectedConversation.starred
                          ? "fill-current"
                          : "text-neutral-500"
                      }`}
                    />
                  </button>
                  <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <MoreHorizontal className="h-5 w-5 text-neutral-500" />
                  </button>
                </div>
              </header>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Date separator */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-neutral-200" />
                  <span className="text-xs text-neutral-400 font-medium">
                    Aujourd'hui
                  </span>
                  <div className="flex-1 h-px bg-neutral-200" />
                </div>

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl ${
                        message.senderId === "me"
                          ? "bg-primary-500 text-white rounded-br-md"
                          : "bg-neutral-100 text-neutral-900 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 ${
                          message.senderId === "me"
                            ? "text-primary-200"
                            : "text-neutral-400"
                        }`}
                      >
                        <span className="text-xs">{message.time}</span>
                        {message.senderId === "me" && (
                          <CheckCheck className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-neutral-200">
                <div className="flex items-end gap-3">
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      <Paperclip className="h-5 w-5 text-neutral-500" />
                    </button>
                    <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      <ImageIcon className="h-5 w-5 text-neutral-500" />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      placeholder="Écrivez votre message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      rows={1}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 bg-neutral-50 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 rounded transition-colors">
                      <Smile className="h-5 w-5 text-neutral-400" />
                    </button>
                  </div>
                  <Button className="h-12 w-12 p-0 rounded-xl">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              <p>Sélectionnez une conversation</p>
            </div>
          )}
        </main>

        {/* Panneau info (optionnel) */}
        <aside className="hidden xl:block w-72 bg-white border-l border-neutral-200 p-6">
          {selectedConversation && (
            <div className="text-center">
              <Avatar
                name={selectedConversation.user.name}
                size="xl"
                className="mx-auto"
              />
              <h3 className="mt-4 font-semibold text-neutral-900">
                {selectedConversation.user.name}
              </h3>
              <p className="text-sm text-neutral-500">
                {selectedConversation.user.title}
              </p>

              <div className="flex justify-center gap-2 mt-4">
                <Link href="/profile">
                  <Button variant="secondary" size="sm">
                    Voir le profil
                  </Button>
                </Link>
              </div>

              <div className="mt-8 text-left">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                  Actions
                </h4>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Archive className="h-4 w-4" />
                    Archiver la conversation
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                    Supprimer la conversation
                  </button>
                </div>
              </div>

              <div className="mt-8 text-left">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                  Fichiers partagés
                </h4>
                <p className="text-sm text-neutral-500">
                  Aucun fichier partagé
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
