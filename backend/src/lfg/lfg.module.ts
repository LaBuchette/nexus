import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LfgService } from './lfg.service';
import { LfgController } from './lfg.controller';
import { LFGPost } from './entities/lfg-post.entity';
import { UsersModule } from '../users/users.module';
import { ClubsModule } from '../clubs/clubs.module';

@Module({
  imports: [TypeOrmModule.forFeature([LFGPost]), UsersModule, ClubsModule],
  controllers: [LfgController],
  providers: [LfgService],
  exports: [LfgService],
})
export class LfgModule {}
