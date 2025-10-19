import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendRequest } from './entities/friend-request.entity';
import { UsersModule } from '../users/users.module';
import { BlocksModule } from '../blocks/blocks.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest]),
    UsersModule,
    BlocksModule, // ← AJOUTE CETTE LIGNE
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
