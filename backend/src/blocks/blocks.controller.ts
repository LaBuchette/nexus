import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import { BlocksService } from './blocks.service';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

interface BlockUserDto {
  reason?: string;
}

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  // Bloquer un utilisateur
  @Post(':userId')
  @UseGuards(AuthGuard('jwt'))
  blockUser(
    @Param('userId') blockedId: string,
    @Body() blockUserDto: BlockUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.blocksService.blockUser(
      req.user.id,
      blockedId,
      blockUserDto.reason,
    );
  }

  // Débloquer un utilisateur
  @Delete(':userId')
  @UseGuards(AuthGuard('jwt'))
  unblockUser(@Param('userId') blockedId: string, @Req() req: RequestWithUser) {
    return this.blocksService.unblockUser(req.user.id, blockedId);
  }

  // Récupérer mes utilisateurs bloqués
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getBlockedUsers(@Req() req: RequestWithUser) {
    return this.blocksService.getBlockedUsers(req.user.id);
  }

  // Vérifier si j'ai bloqué un utilisateur
  @Get('check/:userId')
  @UseGuards(AuthGuard('jwt'))
  async checkIfBlocked(
    @Param('userId') blockedId: string,
    @Req() req: RequestWithUser,
  ) {
    const isBlocked = await this.blocksService.isBlocked(
      req.user.id,
      blockedId,
    );
    return { isBlocked };
  }
}
