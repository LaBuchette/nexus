import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  // Créer une notification
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedEntityId?: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      type,
      title,
      message,
      relatedEntityId,
      isRead: false,
    });

    return await this.notificationsRepository.save(notification);
  }

  // Récupérer toutes les notifications d'un utilisateur (les plus récentes en premier)
  async findByUser(userId: string): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Récupérer uniquement les notifications NON LUES
  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  // Compter le nombre de notifications non lues (pour le badge)
  async countUnread(userId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  // Marquer UNE notification comme lue
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
  }

  // Marquer TOUTES les notifications comme lues
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  // Supprimer une notification
  async remove(notificationId: string, userId: string): Promise<void> {
    await this.notificationsRepository.delete({
      id: notificationId,
      userId,
    });
  }
}
