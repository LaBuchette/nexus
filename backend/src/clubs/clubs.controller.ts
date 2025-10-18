import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { User } from '../users/entities/user.entity';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  // CREATE - Créer un club (protégé par JWT)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createClubDto: CreateClubDto, @Req() req: RequestWithUser) {
    return this.clubsService.create(createClubDto, req.user.id);
  }

  // READ ALL - Liste tous les clubs (public)
  @Get()
  findAll() {
    return this.clubsService.findAll();
  }

  // READ MY CLUBS - Mes clubs en tant que owner (protégé)
  @Get('my-clubs')
  @UseGuards(AuthGuard('jwt'))
  findMyClubs(@Req() req: RequestWithUser) {
    return this.clubsService.findByOwner(req.user.id);
  }

  // READ ONE - Détails d'un club (public)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  // UPDATE - Modifier un club (protégé, owner only)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateClubDto: UpdateClubDto,
    @Req() req: RequestWithUser,
  ) {
    return this.clubsService.update(id, updateClubDto, req.user.id);
  }

  // DELETE - Supprimer un club (protégé, owner only)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.clubsService.remove(id, req.user.id);
  }

  // === ROUTES MEMBRES ===

  // JOIN - Rejoindre un club (protégé)
  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  joinClub(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.clubsService.joinClub(id, req.user.id);
  }

  // LEAVE - Quitter un club (protégé)
  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  leaveClub(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.clubsService.leaveClub(id, req.user.id);
  }

  // MEMBERS - Liste des membres (public)
  @Get(':id/members')
  getClubMembers(@Param('id') id: string) {
    return this.clubsService.getClubMembers(id);
  }

  // IS MEMBER - Vérifier si l'utilisateur est membre (protégé)
  @Get(':id/is-member')
  @UseGuards(AuthGuard('jwt'))
  async isUserMember(@Param('id') id: string, @Req() req: RequestWithUser) {
    const isMember = await this.clubsService.isUserMember(id, req.user.id);
    return { isMember };
  }

  // MY MEMBERSHIPS - Clubs dont je suis membre (protégé)
  @Get('user/memberships')
  @UseGuards(AuthGuard('jwt'))
  getUserClubs(@Req() req: RequestWithUser) {
    return this.clubsService.getUserClubs(req.user.id);
  }
}
