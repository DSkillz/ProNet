"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Avatar, Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Bell,
  BellOff,
  UserPlus,
  ThumbsUp,
  MessageSquare,
  Briefcase,
  Award,
  AtSign,
  Share2,
  TrendingUp,
  Settings,
  Check,
  MoreHorizontal,
  Trash2,
  Eye,
  Clock,
} from "lucide-react";
import Link from "next/link";

type NotificationType =
  | "connection"
  | "like"
  | "comment"
  | "mention"
  | "job"
  | "share"
  | "endorsement"
  | "view";

interface Notification {
  id: number;
  type: NotificationType;
  read: boolean;
  time: string;
  user?: {
    name: string;
    avatar: null;
  };
  content: string;
  link: string;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: "connection",
    read: false,
    time: "Il y a 5 min",
    user: { name: "Alice Moreau", avatar: null },
    content: "a accepté votre invitation à se connecter",
    link: "/profile",
  },
  {
    id: 2,
    type: "like",
    read: false,
    time: "Il y a 30 min",
    user: { name: "Thomas Bernard", avatar: null },
    content: "et 23 autres personnes ont aimé votre publication",
    link: "/feed",
  },
  {
    id: 3,
    type: "comment",
    read: false,
    time: "Il y a 1h",
    user: { name: "Sophie Martin", avatar: null },
    content: "a commenté votre publication : \"Super article, très instructif !\"",
    link: "/feed",
  },
  {
    id: 4,
    type: "job",
    read: false,
    time: "Il y a 2h",
    content: "5 nouvelles offres d'emploi correspondent à vos critères",
    link: "/jobs",
  },
  {
    id: 5,
    type: "mention",
    read: true,
    time: "Il y a 3h",
    user: { name: "Pierre Durand", avatar: null },
    content: "vous a mentionné dans un commentaire",
    link: "/feed",
  },
  {
    id: 6,
    type: "view",
    read: true,
    time: "Il y a 5h",
    content: "47 personnes ont consulté votre profil cette semaine",
    link: "/profile",
  },
  {
    id: 7,
    type: "endorsement",
    read: true,
    time: "Hier",
    user: { name: "Julie Chen", avatar: null },
    content: "a recommandé vos compétences en React",
    link: "/profile",
  },
  {
    id: 8,
    type: "share",
    read: true,
    time: "Hier",
    user: { name: "Marc Lefebvre", avatar: null },
    content: "a partagé votre article avec son réseau",
    link: "/feed",
  },
  {
    id: 9,
    type: "connection",
    read: true,
    time: "Il y a 2 jours",
    user: { name: "Emma Wilson", avatar: null },
    content: "souhaite se connecter avec vous",
    link: "/network",
  },
  {
    id: 10,
    type: "job",
    read: true,
    time: "Il y a 3 jours",
    content: "TechCorp recrute ! Lead Developer Frontend - Paris",
    link: "/jobs",
  },
];

const notificationIcons: Record<NotificationType, typeof Bell> = {
  connection: UserPlus,
  like: ThumbsUp,
  comment: MessageSquare,
  mention: AtSign,
  job: Briefcase,
  share: Share2,
  endorsement: Award,
  view: Eye,
};

const notificationColors: Record<NotificationType, string> = {
  connection: "bg-primary-100 text-primary-600",
  like: "bg-red-100 text-red-600",
  comment: "bg-secondary-100 text-secondary-600",
  mention: "bg-purple-100 text-purple-600",
  job: "bg-accent-100 text-accent-600",
  share: "bg-blue-100 text-blue-600",
  endorsement: "bg-yellow-100 text-yellow-600",
  view: "bg-neutral-100 text-neutral-600",
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifs.filter((n) => !n.read).length;

  const filteredNotifs =
    filter === "unread" ? notifs.filter((n) => !n.read) : notifs;

  const markAsRead = (id: number) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-neutral-500 mt-1">
                {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
                {unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Tout marquer comme lu
            </Button>
            <Link href="/settings/notifications">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === "all"
                ? "bg-primary-100 text-primary-700"
                : "text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === "unread"
                ? "bg-primary-100 text-primary-700"
                : "text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Non lues
            {unreadCount > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Liste des notifications */}
        <Card padding="none">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center">
              <BellOff className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">
                {filter === "unread"
                  ? "Aucune notification non lue"
                  : "Aucune notification"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredNotifs.map((notif) => {
                const Icon = notificationIcons[notif.type];
                const colorClass = notificationColors[notif.type];

                return (
                  <div
                    key={notif.id}
                    className={`flex gap-4 p-4 hover:bg-neutral-50 transition-colors ${
                      !notif.read ? "bg-primary-50/50" : ""
                    }`}
                  >
                    {/* Icône ou Avatar */}
                    <div className="flex-shrink-0">
                      {notif.user ? (
                        <div className="relative">
                          <Avatar name={notif.user.name} size="md" />
                          <div
                            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${colorClass}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={notif.link}
                        onClick={() => markAsRead(notif.id)}
                        className="block"
                      >
                        <p className="text-neutral-900">
                          {notif.user && (
                            <span className="font-semibold">
                              {notif.user.name}{" "}
                            </span>
                          )}
                          {notif.content}
                        </p>
                        <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {notif.time}
                        </p>
                      </Link>

                      {/* Actions pour certains types */}
                      {notif.type === "connection" &&
                        notif.content.includes("souhaite") && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm">Accepter</Button>
                            <Button variant="ghost" size="sm">
                              Ignorer
                            </Button>
                          </div>
                        )}
                    </div>

                    {/* Indicateur non lu et actions */}
                    <div className="flex items-start gap-2">
                      {!notif.read && (
                        <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-2" />
                      )}
                      <div className="relative group">
                        <button className="p-2 hover:bg-neutral-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4 text-neutral-400" />
                        </button>
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                            >
                              <Check className="h-4 w-4" />
                              Marquer comme lu
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Préférences */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              Préférences de notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Personnalisez les notifications que vous recevez pour rester
              informé sans être submergé.
            </p>
            <Link href="/settings/notifications">
              <Button variant="secondary" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Gérer mes préférences
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
