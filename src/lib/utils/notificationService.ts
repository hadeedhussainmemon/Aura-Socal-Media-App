"use client";

import { NotificationData } from '../../components/shared/NotificationPopup';

export interface DbNotification {
  _id: string;
  userId: string;
  type: 'new_post' | 'like' | 'comment' | 'follow';
  title: string;
  message: string;
  avatar: string;
  actionUrl?: string;
  createdAt: string;
  read: boolean;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private listeners: Set<(notification: NotificationData) => void> = new Set();
  private pollingInterval: NodeJS.Timeout | null = null;

  private constructor() { }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Poll for notifications in MongoDB (Alternative to real-time for now)
  async subscribeToNotifications(userId: string) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Initial check
    this.checkForNewNotifications(userId);

    // Poll every 10 seconds
    this.pollingInterval = setInterval(() => {
      this.checkForNewNotifications(userId);
    }, 10000);
  }

  private async checkForNewNotifications(userId: string) {
    try {
      // This is a client-side call to a server action or API
      // For simplicity in this refactor, we'll assume a getUserNotifications action exists
      const notifications = await this.getUserNotifications(userId, 1);
      if (notifications.length > 0 && !notifications[0].read) {
        // Simple logic to avoid repeat popups: only if newer than last seen?
        // In a real app, you'd track the last seen notification ID
      }
    } catch (error) {
      // Silently fail polling
    }
  }

  unsubscribeFromNotifications() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }


  // Add listener for popup notifications
  addNotificationListener(listener: (notification: NotificationData) => void) {
    this.listeners.add(listener);
  }

  removeNotificationListener(listener: (notification: NotificationData) => void) {
    this.listeners.delete(listener);
  }

  // The creation methods should now be Server Actions for better performance and security
  // But to keep consistency with existing service usage, we keep placeholders that call actions
  // Actually, better to refactor callers to use Server Actions directly.

  async getUserNotifications(userId: string, limit = 20) {
    // This should be implemented as a server action and called here or directly
    const res = await fetch(`/api/notifications?userId=${userId}&limit=${limit}`);
    if (res.ok) {
      return await res.json();
    }
    return [];
  }

  async markNotificationAsRead(notificationId: string) {
    await fetch(`/api/notifications/${notificationId}`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead(userId: string) {
    await fetch(`/api/notifications/read-all`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  // Create notification when someone creates a new post
  async createNewPostNotifications(postId: string, creatorId: string, creatorName: string, creatorAvatar: string, postCaption: string) {
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        type: 'new_post',
        postId,
        creatorId,
        creatorName,
        creatorAvatar,
        postCaption: this.truncateText(postCaption, 50)
      })
    });
  }

  // Create notification when someone likes a post
  async createLikeNotification(postId: string, postOwnerId: string, likerUserId: string, likerName: string, likerAvatar: string) {
    if (postOwnerId === likerUserId) return;
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        type: 'like',
        postId,
        postOwnerId,
        likerUserId,
        likerName,
        likerAvatar
      })
    });
  }

  // Create notification when someone follows a user
  async createFollowNotification(followedUserId: string, followerUserId: string, followerName: string, followerAvatar: string) {
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        type: 'follow',
        followedUserId,
        followerUserId,
        followerName,
        followerAvatar
      })
    });
  }

  // Create notification when someone comments on a post
  async createCommentNotification(postId: string, postOwnerId: string, commenterUserId: string, commenterName: string, commenterAvatar: string, commentText: string) {
    if (postOwnerId === commenterUserId) return;
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        type: 'comment',
        postId,
        postOwnerId,
        commenterUserId,
        commenterName,
        commenterAvatar,
        commentText: this.truncateText(commentText, 50)
      })
    });
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

export const notificationService = NotificationService.getInstance();
