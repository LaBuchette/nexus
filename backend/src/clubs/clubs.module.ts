import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { Club } from './entities/club.entity';
import { Member } from './entities/member.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Member, User])],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
