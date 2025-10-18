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
    const loginResult = this.authService.login(req.user);

    // Détecter l'hostname depuis la requête
    const hostname = req.headers.host?.split(':')[0] || 'localhost';
    const frontendPort = '3001';

    // Redirection vers le frontend avec le token et les infos user
    const frontendUrl = `http://${hostname}:${frontendPort}/callback?token=${loginResult.access_token}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`;

    return res.redirect(frontendUrl);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: RequestWithUser): User {
    // Cette route est protégée par JWT
    // Seuls les utilisateurs connectés peuvent y accéder
    return req.user;
  }
}
