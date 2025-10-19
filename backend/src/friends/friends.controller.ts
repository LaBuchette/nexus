import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import { FriendsService } from './friends.service';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // Envoyer une demande d'ami
  @Post('request/:userId')
  @UseGuards(AuthGuard('jwt'))
  sendRequest(
    @Param('userId') receiverId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.sendRequest(req.user.id, receiverId);
  }

  // Accepter une demande
  @Post('accept/:requestId')
  @UseGuards(AuthGuard('jwt'))
  acceptRequest(
    @Param('requestId') requestId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.acceptRequest(requestId, req.user.id);
  }

  // Refuser une demande
  @Post('reject/:requestId')
  @UseGuards(AuthGuard('jwt'))
  rejectRequest(
    @Param('requestId') requestId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.friendsService.rejectRequest(requestId, req.user.id);
  }

  // Récupérer mes amis
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getFriends(@Req() req: RequestWithUser) {
    return this.friendsService.getFriends(req.user.id);
  }

  // Récupérer les demandes reçues en attente
  @Get('pending')
  @UseGuards(AuthGuard('jwt'))
  getPendingRequests(@Req() req: RequestWithUser) {
    return this.friendsService.getPendingRequests(req.user.id);
  }

  // Récupérer les demandes envoyées en attente
  @Get('sent')
  @UseGuards(AuthGuard('jwt'))
  getSentRequests(@Req() req: RequestWithUser) {
    return this.friendsService.getSentRequests(req.user.id);
  }

  // Vérifier si deux utilisateurs sont amis
  @Get('check/:userId')
  @UseGuards(AuthGuard('jwt'))
  async checkFriendship(
    @Param('userId') otherUserId: string,
    @Req() req: RequestWithUser,
  ) {
    const areFriends = await this.friendsService.areFriends(
      req.user.id,
      otherUserId,
    );
    return { areFriends };
  }
}
