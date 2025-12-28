'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { notificationsApi } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function useRealtimeNotifications() {
  const { onNotification, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const response = await notificationsApi.getAll();
    if (response.data) {
      setNotifications(response.data.notifications || []);
    }
    setLoading(false);
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const response = await notificationsApi.getUnreadCount();
    if (response.data) {
      setUnreadCount(response.data.count);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onNotification((notification) => {
      const newNotification: Notification = {
        id: notification.id || crypto.randomUUID(),
        type: notification.type,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        isRead: false,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, [isConnected, onNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
