import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

// ---- Types ----

export interface PaginatedNotifications {
  data: Prisma.NotificationGetPayload<object>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- Service class ----

export class NotificationService {
  /**
   * Create a new notification for a given recipient.
   */
  async createNotification(
    recipientAddress: string,
    type: string,
    title: string,
    message: string,
    invoiceId?: number,
  ): Promise<Prisma.NotificationGetPayload<object>> {
    try {
      const notification = await prisma.notification.create({
        data: {
          recipientAddress: recipientAddress.toLowerCase(),
          type,
          title,
          message,
          invoiceId: invoiceId ?? null,
          isRead: false,
        },
      });

      return notification;
    } catch (error) {
      console.error('[NotificationService] Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a recipient with optional filtering and pagination.
   */
  async getNotifications(
    recipientAddress: string,
    unreadOnly = false,
    page = 1,
    limit = 20,
  ): Promise<PaginatedNotifications> {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.NotificationWhereInput = {
      recipientAddress: recipientAddress.toLowerCase(),
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: number): Promise<Prisma.NotificationGetPayload<object>> {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new Error(`Notification with id=${id} not found`);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return updated;
  }

  /**
   * Mark all notifications for a recipient as read.
   * Returns the count of notifications that were updated.
   */
  async markAllAsRead(recipientAddress: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        recipientAddress: recipientAddress.toLowerCase(),
        isRead: false,
      },
      data: { isRead: true },
    });

    return result.count;
  }

  /**
   * Get the count of unread notifications for a recipient.
   */
  async getUnreadCount(recipientAddress: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        recipientAddress: recipientAddress.toLowerCase(),
        isRead: false,
      },
    });

    return count;
  }
}
