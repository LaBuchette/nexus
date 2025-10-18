import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Club } from './club.entity';

export enum MemberRole {
  OWNER = 'owner', // Créateur du club
  ADMIN = 'admin', // Administrateur
  MEMBER = 'member', // Membre
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relation Many-to-One avec User
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // Relation Many-to-One avec Club
  @ManyToOne(() => Club)
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @Column()
  clubId: string;

  // Rôle du membre dans le club
  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: MemberRole;

  @CreateDateColumn()
  joinedAt: Date;
}
