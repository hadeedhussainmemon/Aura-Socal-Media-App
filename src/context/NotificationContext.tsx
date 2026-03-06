"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from "next-auth/react";
import { NotificationData } from '../components/shared/NotificationPopup';
import { notificationService } from '../lib/utils/notificationService';

interface NotificationContextType {
  currentNotification: NotificationData | null;
  showNotification: (notification: NotificationData) => void;
  hideNotification: () => void;
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  currentNotification: null,
  showNotification: () => { },
  hideNotification: () => { },
  unreadCount: 0,
  refreshUnreadCount: () => { },
});

export const useNotificationContext = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = status === "authenticated";

  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle new notifications
  const handleNewNotification = (notification: NotificationData) => {
    setCurrentNotification(notification);
    setUnreadCount(prev => prev + 1);
  };

  // Show notification manually
  const showNotification = (notification: NotificationData) => {
    setCurrentNotification(notification);
  };

  // Hide current notification
  const hideNotification = () => {
    setCurrentNotification(null);
  };

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    const userId = ((user as { _id?: string })?._id || user?.id) as string;
    if (!userId) return;

    try {
      const notifications = await notificationService.getUserNotifications(userId, 50);
      const unread = notifications.filter((n: { read: boolean }) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  }, [user]);

  // Subscribe to real-time notifications when user is authenticated
  useEffect(() => {
    const userId = ((user as { _id?: string })?._id || user?.id) as string;
    if (isAuthenticated && userId) {
      // Subscribe to real-time notifications
      notificationService.subscribeToNotifications(userId);

      // Add notification listener
      notificationService.addNotificationListener(handleNewNotification);

      // Get initial unread count
      refreshUnreadCount();

      return () => {
        // Cleanup
        notificationService.removeNotificationListener(handleNewNotification);
        notificationService.unsubscribeFromNotifications();
      };
    }
  }, [isAuthenticated, user, refreshUnreadCount]);

  const value: NotificationContextType = {
    currentNotification,
    showNotification,
    hideNotification,
    unreadCount,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
