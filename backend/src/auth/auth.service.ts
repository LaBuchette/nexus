import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateDiscordUser(discordUserData: {
    discordId: string;
    username: string;
    discriminator: string;
    email: string;
    avatar: string;
  }): Promise<User> {
    // Chercher l'utilisateur dans la base de données
    let user = await this.userRepository.findOne({
      where: { discordId: discordUserData.discordId },
    });

    // Si l'utilisateur n'existe pas, on le crée
    if (!user) {
      user = this.userRepository.create({
        discordId: discordUserData.discordId,
        username: discordUserData.username,
        discriminator: discordUserData.discriminator,
        email: discordUserData.email,
        avatar: discordUserData.avatar,
      });
      await this.userRepository.save(user);
    } else {
      // Si l'utilisateur existe déjà, on met à jour ses informations
      user.username = discordUserData.username;
      user.discriminator = discordUserData.discriminator;
      user.email = discordUserData.email;
      user.avatar = discordUserData.avatar;
      await this.userRepository.save(user);
    }

    return user;
  }

  login(user: User) {
    const payload = {
      sub: user.id,
      discordId: user.discordId,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    };
  }
}
