import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Club } from '../../clubs/entities/club.entity';

@Entity('lfg_posts')
export class LFGPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  game: string;

  @Column({ type: 'int', default: 1 })
  playersNeeded: number;

  @ManyToOne(() => User, { eager: true })
  creator: User;

  @Column()
  creatorId: string;

  @ManyToOne(() => Club, (club) => club.id)
  club: Club;

  @Column()
  clubId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
