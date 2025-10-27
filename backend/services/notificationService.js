/**
 * Notification Service
 * Handles creation, retrieval, and management of user notifications
 */

const { pool } = require('../config/database');

/**
 * Create a new notification for a user
 */
const createNotification = async (userId, type, title, message, actionUrl = null) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message, action_url)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, actionUrl]
    );

    console.log(`✅ Notification created for user ${userId}: ${title}`);

    return {
      id: result.insertId,
      userId,
      type,
      title,
      message,
      actionUrl
    };
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 */
const getNotifications = async (userId, limit = 20, offset = 0, unreadOnly = false) => {
  try {
    let query = `
      SELECT id, user_id, type, title, message, action_url, is_read, read_at, created_at
      FROM notifications
      WHERE user_id = ?
    `;

    const params = [userId];

    if (unreadOnly) {
      query += ' AND is_read = FALSE';
    }

    // MySQL doesn't support parameterized LIMIT/OFFSET in some versions
    // So we'll validate and insert them directly
    const safeLimit = parseInt(limit) || 20;
    const safeOffset = parseInt(offset) || 0;

    query += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [notifications] = await pool.execute(query, params);

    return notifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
  try {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return result[0].count;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Notification not found or unauthorized');
    }

    console.log(`✅ Notification ${notificationId} marked as read`);
    return true;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  try {
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    console.log(`✅ Marked ${result.affectedRows} notifications as read for user ${userId}`);
    return result.affectedRows;
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Notification not found or unauthorized');
    }

    console.log(`✅ Notification ${notificationId} deleted`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete old notifications (cleanup job)
 */
const deleteOldNotifications = async (daysOld = 30) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY) AND is_read = TRUE',
      [daysOld]
    );

    console.log(`✅ Deleted ${result.affectedRows} old notifications`);
    return result.affectedRows;
  } catch (error) {
    console.error('❌ Error deleting old notifications:', error);
    throw error;
  }
};

/**
 * Get user notification preferences
 */
const getUserPreferences = async (userId) => {
  try {
    const [preferences] = await pool.execute(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );

    // If no preferences exist, create default ones
    if (preferences.length === 0) {
      await pool.execute(
        'INSERT INTO notification_preferences (user_id) VALUES (?)',
        [userId]
      );

      const [newPreferences] = await pool.execute(
        'SELECT * FROM notification_preferences WHERE user_id = ?',
        [userId]
      );

      return newPreferences[0];
    }

    return preferences[0];
  } catch (error) {
    console.error('❌ Error getting notification preferences:', error);
    throw error;
  }
};

/**
 * Update user notification preferences
 */
const updateUserPreferences = async (userId, preferences) => {
  try {
    const {
      email_enabled,
      push_enabled,
      booking_notifications,
      payment_notifications,
      marketing_notifications
    } = preferences;

    const [result] = await pool.execute(
      `UPDATE notification_preferences
       SET email_enabled = ?, push_enabled = ?, booking_notifications = ?,
           payment_notifications = ?, marketing_notifications = ?
       WHERE user_id = ?`,
      [
        email_enabled,
        push_enabled,
        booking_notifications,
        payment_notifications,
        marketing_notifications,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      // Create preferences if they don't exist
      await pool.execute(
        `INSERT INTO notification_preferences
         (user_id, email_enabled, push_enabled, booking_notifications,
          payment_notifications, marketing_notifications)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          email_enabled,
          push_enabled,
          booking_notifications,
          payment_notifications,
          marketing_notifications
        ]
      );
    }

    console.log(`✅ Updated notification preferences for user ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Create notification templates for common events
 */
const notificationTemplates = {
  // Booking notifications
  bookingCreated: (companionName) => ({
    type: 'booking',
    title: 'New Booking Request',
    message: `You have a new booking request from ${companionName}. Please review and confirm.`,
    actionUrl: '/companion-dashboard'
  }),

  bookingConfirmed: (companionName) => ({
    type: 'booking',
    title: 'Booking Confirmed',
    message: `Your booking with ${companionName} has been confirmed!`,
    actionUrl: '/client-dashboard'
  }),

  bookingRejected: (companionName) => ({
    type: 'booking',
    title: 'Booking Declined',
    message: `Unfortunately, your booking with ${companionName} was declined.`,
    actionUrl: '/client-dashboard'
  }),

  bookingCancelled: (userName, role) => ({
    type: 'booking',
    title: 'Booking Cancelled',
    message: `Your booking with ${userName} has been cancelled by the ${role}.`,
    actionUrl: role === 'client' ? '/companion-dashboard' : '/client-dashboard'
  }),

  bookingReminder: (companionName, date, time) => ({
    type: 'booking',
    title: 'Booking Reminder',
    message: `Don't forget! You have a booking with ${companionName} tomorrow at ${time}.`,
    actionUrl: '/client-dashboard'
  }),

  // Application notifications
  applicationApproved: () => ({
    type: 'application',
    title: 'Application Approved!',
    message: 'Congratulations! Your companion application has been approved. You can now start accepting bookings.',
    actionUrl: '/companion-dashboard'
  }),

  applicationRejected: (reason) => ({
    type: 'application',
    title: 'Application Update',
    message: `Your companion application needs attention: ${reason}`,
    actionUrl: '/companion-profile'
  }),

  // Payment notifications
  paymentReceived: (amount, clientName) => ({
    type: 'payment',
    title: 'Payment Received',
    message: `You've received a payment of $${amount} from ${clientName}.`,
    actionUrl: '/companion-dashboard'
  }),

  paymentFailed: () => ({
    type: 'payment',
    title: 'Payment Failed',
    message: 'There was an issue processing your payment. Please update your payment method.',
    actionUrl: '/client-dashboard'
  }),

  // Account notifications
  welcomeMessage: (userName, role = 'client') => ({
    type: 'account',
    title: 'Welcome to Meytle!',
    message: `Hi ${userName}! Welcome to Meytle. Complete your profile to get started.`,
    actionUrl: role === 'companion' ? '/companion-profile' : '/client-profile'
  }),

  profileIncomplete: (role = 'client') => ({
    type: 'account',
    title: 'Complete Your Profile',
    message: 'Your profile is incomplete. Complete it to unlock all features.',
    actionUrl: role === 'companion' ? '/companion-profile' : '/client-profile'
  }),

  // System notifications
  systemMaintenance: (date, time) => ({
    type: 'system',
    title: 'Scheduled Maintenance',
    message: `System maintenance scheduled for ${date} at ${time}. The platform may be temporarily unavailable.`,
    actionUrl: null
  })
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteOldNotifications,
  getUserPreferences,
  updateUserPreferences,
  notificationTemplates
};