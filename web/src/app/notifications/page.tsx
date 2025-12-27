"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout";
import { Button, Avatar, Card, Badge } from "@/components/ui";
import {
  Bell,
  ThumbsUp,
  MessageCircle,
  UserPlus,
  Briefcase,
  Eye,
  CheckCircle,
  Loader2,
  Settings,
  Check,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { notificationsApi } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/utils";

type NotificationType =
  | "CONNECTION_REQUEST"
  | "CONNECTION_ACCEPTED"
  | "POST_LIKE"
  | "POST_COMMENT"
  | "JOB_MATCH"
  | "PROFILE_VIEW"
  | "MENTION"
  | "MESSAGE";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    headline?: string;
  };
  relatedPost?: {
    id: string;
    content: string;
  };
  relatedJob?: {
    id: string;
    title: string;
  };
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "CONNECTION_REQUEST":
    case "CONNECTION_ACCEPTED":
      return UserPlus;
    case "POST_LIKE":
      return ThumbsUp;
    case "POST_COMMENT":
    case "MENTION":
      return MessageCircle;
    case "JOB_MATCH":
      return Briefcase;
    case "PROFILE_VIEW":
      return Eye;
    case "MESSAGE":
      return MessageCircle;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "CONNECTION_REQUEST":
    case "CONNECTION_ACCEPTED":
      return "text-primary-500 bg-primary-100";
    case "POST_LIKE":
      return "text-red-500 bg-red-100";
    case "POST_COMMENT":
    case "MENTION":
      return "text-secondary-500 bg-secondary-100";
    case "JOB_MATCH":
      return "text-accent-500 bg-accent-100";
    case "PROFILE_VIEW":
      return "text-purple-500 bg-purple-100";
    case "MESSAGE":
      return "text-green-500 bg-green-100";
    default:
      return "text-neutral-500 bg-neutral-100";
  }
};

const getNotificationLink = (notification: Notification): string => {
  switch (notification.type) {
    case "CONNECTION_REQUEST":
      return "/network";
    case "CONNECTION_ACCEPTED":
      return notification.actor ? `/profile/${notification.actor.id}` : "/network";
    case "POST_LIKE":
    case "POST_COMMENT":
    case "MENTION":
      return notification.relatedPost ? `/posts/${notification.relatedPost.id}` : "/feed";
    case "JOB_MATCH":
      return notification.relatedJob ? `/jobs/${notification.relatedJob.id}` : "/jobs";
    case "PROFILE_VIEW":
      return notification.actor ? `/profile/${notification.actor.id}` : "/profile";
    case "MESSAGE":
      return "/messages";
    default:
      return "/feed";
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const result = await notificationsApi.getAll(filter === "unread");
    if (result.data) {
      setNotifications(result.data as Notification[]);
    }
    setIsLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id);
    const result = await notificationsApi.markAsRead(id);
    if (!result.error) {
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
    }
    setActionLoading(null);
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading("all");
    const result = await notificationsApi.markAllAsRead();
    if (!result.error) {
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    }
    setActionLoading(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Header */}
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMarkAllAsRead}
                    disabled={actionLoading === "all"}
                  >
                    {actionLoading === "all" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Tout marquer comme lu
                      </>
                    )}
                  </Button>
                )}
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Settings className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Non lues
                {unreadCount > 0 && (
                  <Badge variant="primary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </Card>

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : notifications.length === 0 ? (
            <Card className="text-center py-12">
              <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                {filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
              </h3>
              <p className="text-neutral-500">
                {filter === "unread"
                  ? "Vous avez lu toutes vos notifications."
                  : "Vous recevrez des notifications lorsque quelqu'un interagit avec votre profil."}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                const link = getNotificationLink(notification);

                return (
                  <Link key={notification.id} href={link}>
                    <Card
                      className={`transition-all hover:shadow-md cursor-pointer ${
                        !notification.read ? "bg-primary-50/50 border-l-4 border-l-primary-500" : ""
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-4">
                        {notification.actor ? (
                          <div className="relative">
                            <Avatar
                              name={`${notification.actor.firstName} ${notification.actor.lastName}`}
                              src={notification.actor.avatarUrl}
                              size="md"
                            />
                            <div
                              className={`absolute -bottom-1 -right-1 p-1 rounded-full ${colorClasses}`}
                            >
                              <Icon className="h-3 w-3" />
                            </div>
                          </div>
                        ) : (
                          <div className={`p-3 rounded-full ${colorClasses}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-neutral-800 ${
                              !notification.read ? "font-medium" : ""
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-sm text-neutral-500 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt))}
                          </p>
                        </div>

                        {!notification.read && (
                          <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
