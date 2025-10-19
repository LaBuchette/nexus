import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { Block } from './entities/block.entity';
import { UsersModule } from '../users/users.module';
import { FriendRequest } from '../friends/entities/friend-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Block, FriendRequest]), // ← Ajouté FriendRequest
    UsersModule,
  ],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
