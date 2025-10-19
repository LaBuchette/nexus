import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  blocker: User;

  @Column()
  blockerId: string;

  @ManyToOne(() => User, { eager: true })
  blocked: User;

  @Column()
  blockedId: string;

  @Column({ type: 'text', nullable: true, default: null })
  reason: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
