import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_REQUEST_ACCEPTED = 'friend_request_accepted',
  CLUB_INVITATION = 'club_invitation',
  CLUB_JOIN = 'club_join',
  MESSAGE = 'message',
  LFG_RESPONSE = 'lfg_response',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // À qui est destinée la notification
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  // Type de notification
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  // Contenu
  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  // L'entité liée (ID de la demande d'ami, du club, etc.)
  @Column({ nullable: true })
  relatedEntityId: string;

  // État de lecture
  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
