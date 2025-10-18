import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import { LfgService } from './lfg.service';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

interface CreateLfgDto {
  title: string;
  description: string;
  game: string;
  playersNeeded: number;
  clubId: string;
}

@Controller('lfg')
export class LfgController {
  constructor(private readonly lfgService: LfgService) {}

  // CREATE - Créer une annonce LFG (protégé par JWT)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createLfgDto: CreateLfgDto, @Req() req: RequestWithUser) {
    return this.lfgService.create(
      createLfgDto.title,
      createLfgDto.description,
      createLfgDto.game,
      createLfgDto.playersNeeded,
      req.user.id,
      createLfgDto.clubId,
    );
  }

  // READ ALL - Liste toutes les annonces LFG (public)
  @Get()
  findAll() {
    return this.lfgService.findAll();
  }

  // READ BY CLUB - Annonces d'un club spécifique (public)
  @Get('club/:clubId')
  findByClub(@Param('clubId') clubId: string) {
    return this.lfgService.findByClub(clubId);
  }

  // DELETE - Supprimer une annonce (protégé, creator only)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.lfgService.remove(id, req.user.id);
  }
}
