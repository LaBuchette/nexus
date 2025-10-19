import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClubsModule } from './clubs/clubs.module';
import { MessagesModule } from './messages/messages.module';
import { LfgModule } from './lfg/lfg.module';
import { FriendsModule } from './friends/friends.module';
import { BlocksModule } from './blocks/blocks.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
@Module({
  imports: [
    // Module de configuration pour lire le fichier .env
    ConfigModule.forRoot({
      isGlobal: true, // Rend les configurations accessibles partout
    }),

    // Module TypeORM pour la connexion à PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433', 10),
      username: process.env.DB_USERNAME || 'nexus',
      password: process.env.DB_PASSWORD || 'nexus_password_dev',
      database: process.env.DB_DATABASE || 'nexus_db',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),

    UsersModule,

    AuthModule,

    ClubsModule,

    MessagesModule,

    LfgModule,

    FriendsModule,

    BlocksModule,

    ReportsModule,

    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
