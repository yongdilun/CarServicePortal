import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Notification } from '../api/notificationApi';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  pollingInterval?: number; // in milliseconds
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  pollingInterval = 10000 // Default to 10 seconds for testing
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Import the notificationApi dynamically to avoid circular dependencies
      const { getUserNotifications } = await import('../api/notificationApi');

      const data = await getUserNotifications(user.id, user.userType);
      setNotifications(data);
    } catch (err: any) {
      setError('Failed to fetch notifications: ' + (err.response?.data?.error || err.message));
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // Import the notificationApi dynamically to avoid circular dependencies
      const { markNotificationAsRead } = await import('../api/notificationApi');

      await markNotificationAsRead(notificationId);

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.notificationId === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err: any) {
      setError('Failed to mark notification as read: ' + (err.response?.data?.error || err.message));
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Import the notificationApi dynamically to avoid circular dependencies
      const { markAllNotificationsAsRead } = await import('../api/notificationApi');

      await markAllNotificationsAsRead(user.id, user.userType);

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (err: any) {
      setError('Failed to mark all notifications as read: ' + (err.response?.data?.error || err.message));
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Set up polling for new notifications
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [user, pollingInterval]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
