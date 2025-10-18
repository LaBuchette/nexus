import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import { AuthService } from './auth.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      callbackURL:
        process.env.DISCORD_CALLBACK_URL ||
        'http://localhost:3000/auth/discord/callback',
      scope: ['identify', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { id, username, discriminator, email, avatar } = profile;

    const user = await this.authService.validateDiscordUser({
      discordId: id,
      username: username || 'Unknown',
      discriminator: discriminator || '',
      email: email || '',
      avatar: avatar || '',
    });

    return user;
  }
}
