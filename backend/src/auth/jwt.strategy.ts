import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

// Interface pour typer le payload JWT
interface JwtPayload {
  sub: string;
  discordId: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'nexus_super_secret_key_dev_2025',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    console.log('🔍 JWT Validation - Payload:', payload);
    console.log('🔍 JWT Validation - Looking for user ID:', payload.sub);

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    console.log('🔍 JWT Validation - User found:', user ? 'YES ✅' : 'NO ❌');

    if (!user) {
      console.log('❌ JWT Validation - User not found in database');
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    console.log('✅ JWT Validation - User validated:', user.username);
    return user;
  }
}
