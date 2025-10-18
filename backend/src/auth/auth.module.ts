import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DiscordStrategy } from './discord.strategy';
import { User } from '../users/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'discord' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'nexus_super_secret_key_dev_2025',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
