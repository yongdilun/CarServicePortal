import axios from './axios';

export interface Notification {
  notificationId: number;
  userId: number;
  userType: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  link: string;
}

// Get user notifications
export const getUserNotifications = async (
  userId: number,
  userType: string,
  unreadOnly: boolean = false
): Promise<Notification[]> => {
  try {
    const response = await axios.get(`/api/notifications/${userType}/${userId}?unreadOnly=${unreadOnly}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<{ message: string }> => {
  const response = await axios.post(`/api/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  userId: number,
  userType: string
): Promise<{ message: string }> => {
  const response = await axios.post(`/api/notifications/${userType}/${userId}/read-all`);
  return response.data;
};

// Delete notification
export const deleteNotification = async (notificationId: number): Promise<{ message: string }> => {
  const response = await axios.delete(`/api/notifications/${notificationId}`);
  return response.data;
};

// Delete all notifications
export const deleteAllNotifications = async (
  userId: number,
  userType: string
): Promise<{ message: string }> => {
  const response = await axios.delete(`/api/notifications/${userType}/${userId}`);
  return response.data;
};
