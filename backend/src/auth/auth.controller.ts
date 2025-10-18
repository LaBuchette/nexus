import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { User } from '../users/entities/user.entity';

// Interface pour typer la requête avec l'utilisateur
interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordLogin() {
    // Cette méthode déclenche la redirection vers Discord
    // Passport gère tout automatiquement
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  discordCallback(@Req() req: RequestWithUser, @Res() res: ExpressResponse) {
    // L'utilisateur a été validé par Passport et attaché à req.user
    const loginResult = this.authService.login(req.user);

    // Redirection vers le frontend avec le token
    // Pour l'instant, on retourne juste le JSON
    return res.json(loginResult);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: RequestWithUser): User {
    // Cette route est protégée par JWT
    // Seuls les utilisateurs connectés peuvent y accéder
    return req.user;
  }
}
