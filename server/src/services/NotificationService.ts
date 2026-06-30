import { NotificationRepository, Notification } from '../repositories/NotificationRepository';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  async markRead(id: string, userId: string): Promise<void> {
    return this.notificationRepository.markRead(id, userId);
  }

  async markAllRead(userId: string): Promise<void> {
    return this.notificationRepository.markAllRead(userId);
  }
}
