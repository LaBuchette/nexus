import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReportReason {
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  SPAM = 'spam',
  CHEATING = 'cheating',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  IMPERSONATION = 'impersonation',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Qui signale
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  reporter: User;

  @Column()
  reporterId: string;

  // Qui est signalé
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  reportedUser: User;

  @Column()
  reportedUserId: string;

  // Motif du signalement
  @Column({
    type: 'enum',
    enum: ReportReason,
  })
  reason: ReportReason;

  // Description optionnelle
  @Column({ type: 'text', nullable: true })
  description: string;

  // Statut du signalement
  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
