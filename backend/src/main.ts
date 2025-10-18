import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS pour le réseau local
  app.enableCors({
    origin: ['http://localhost:3001', 'http://192.168.1.12:3001'],
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0'); // ← Écouter sur toutes les interfaces
}
bootstrap();
