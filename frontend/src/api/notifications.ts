/**
 * Notification API Client
 * Handles notification-related API calls
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';

// Configure axios instance with credentials support
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Always send cookies with requests
});

// Types
export interface Notification {
  id: number;
  user_id: number;
  type: 'booking' | 'application' | 'payment' | 'account' | 'system';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  marketing_notifications: boolean;
}

export interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    count: number;
  };
}

export interface UnreadCountResponse {
  status: string;
  data: {
    unreadCount: number;
  };
}

export interface PreferencesResponse {
  status: string;
  data: {
    preferences: NotificationPreferences;
  };
}

// API Functions
const notificationApi = {
  /**
   * Get user notifications
   */
  getNotifications: async (limit: number = 20, offset: number = 0, unreadOnly: boolean = false) => {
    const response = await api.get<NotificationsResponse>('/notifications', {
      params: { limit, offset, unreadOnly }
    });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: number) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: number) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Get notification preferences
   */
  getPreferences: async () => {
    const response = await api.get<PreferencesResponse>('/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  /**
   * Create test notification (development only)
   */
  createTestNotification: async (title: string, message: string, type: string = 'system', actionUrl?: string) => {
    const response = await api.post('/notifications/test', {
      title,
      message,
      type,
      actionUrl
    });
    return response.data;
  }
};

export default notificationApi;