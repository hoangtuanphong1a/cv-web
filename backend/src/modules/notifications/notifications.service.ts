import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationChannel,
} from '../common/entities/notification.entity';
import { User } from '../common/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: {
      channel?: NotificationChannel;
      relatedEntityId?: string;
      relatedEntityType?: string;
      priority?: number;
      expiresAt?: Date;
    },
  ): Promise<Notification> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      channel: data?.channel || NotificationChannel.IN_APP,
      relatedEntityId: data?.relatedEntityId,
      relatedEntityType: data?.relatedEntityType,
      priority: data?.priority || 1,
      expiresAt: data?.expiresAt,
    });

    return this.notificationRepository.save(notification);
  }

  async findAllByUser(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      isRead?: boolean;
      type?: NotificationType;
    } = {},
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  }> {
    const { page = 1, limit = 20, isRead, type } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    if (type) {
      where.type = type;
    }

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return {
      data: notifications,
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    notification.markAsRead();
    return this.notificationRepository.save(notification);
  }

  async markAsUnread(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    notification.markAsUnread();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);
  }

  async deleteExpired(): Promise<void> {
    const now = new Date();
    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('expiresAt IS NOT NULL AND expiresAt < :now', { now })
      .execute();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async createApplicationReceivedNotification(
    employerId: string,
    jobTitle: string,
    applicantName: string,
    applicationId: string,
  ): Promise<Notification> {
    return this.create(
      employerId,
      NotificationType.APPLICATION_RECEIVED,
      'New Application Received',
      `${applicantName} has applied for your job: ${jobTitle}`,
      {
        relatedEntityId: applicationId,
        relatedEntityType: 'application',
        priority: 3,
      },
    );
  }

  async createApplicationStatusChangedNotification(
    applicantId: string,
    jobTitle: string,
    status: string,
    applicationId: string,
  ): Promise<Notification> {
    return this.create(
      applicantId,
      NotificationType.APPLICATION_STATUS_CHANGED,
      'Application Status Updated',
      `Your application for "${jobTitle}" has been ${status}`,
      {
        relatedEntityId: applicationId,
        relatedEntityType: 'application',
        priority: 2,
      },
    );
  }

  async createJobExpiredNotification(
    employerId: string,
    jobTitle: string,
    jobId: string,
  ): Promise<Notification> {
    return this.create(
      employerId,
      NotificationType.JOB_EXPIRED,
      'Job Expired',
      `Your job "${jobTitle}" has expired and is no longer active`,
      {
        relatedEntityId: jobId,
        relatedEntityType: 'job',
        priority: 2,
      },
    );
  }

  async createSubscriptionExpiredNotification(
    userId: string,
    planName: string,
  ): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.SUBSCRIPTION_EXPIRED,
      'Subscription Expired',
      `Your ${planName} subscription has expired. Renew now to continue using premium features.`,
      {
        priority: 4,
      },
    );
  }

  async createCvViewedNotification(
    jobSeekerId: string,
    companyName: string,
    cvId: string,
  ): Promise<Notification> {
    return this.create(
      jobSeekerId,
      NotificationType.CV_VIEWED,
      'CV Viewed',
      `${companyName} has viewed your CV`,
      {
        relatedEntityId: cvId,
        relatedEntityType: 'cv',
        priority: 1,
      },
    );
  }

  async createSystemAnnouncement(
    userIds: string[],
    title: string,
    message: string,
    expiresAt?: Date,
  ): Promise<Notification[]> {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        userId,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title,
        message,
        channel: NotificationChannel.IN_APP,
        priority: 2,
        expiresAt,
      }),
    );

    return this.notificationRepository.save(notifications);
  }

  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    byType: Record<string, number>;
  }> {
    const [total, unread, read] = await Promise.all([
      this.notificationRepository.count({ where: { userId } }),
      this.notificationRepository.count({ where: { userId, isRead: false } }),
      this.notificationRepository.count({ where: { userId, isRead: true } }),
    ]);

    const byType = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.type')
      .getRawMany();

    const byTypeRecord: Record<string, number> = {};
    byType.forEach((item) => {
      byTypeRecord[item.type] = parseInt(item.count);
    });

    return {
      total,
      unread,
      read,
      byType: byTypeRecord,
    };
  }
}
