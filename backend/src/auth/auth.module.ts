import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DiscordStrategy } from './discord.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module'; // ← AJOUTEZ CETTE LIGNE

@Module({
  imports: [
    PassportModule,
    UsersModule, // ← AJOUTEZ CETTE LIGNE
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy, JwtStrategy],
})
export class AuthModule {}
