import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: 'http://localhost:3001', // URL du frontend
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
