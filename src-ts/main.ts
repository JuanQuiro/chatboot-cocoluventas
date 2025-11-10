import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors();

  // Prefix for API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('');
  console.log('🤖 ======================================');
  console.log('🤖  CHATBOT COCOLU - EMBER DRAGO');
  console.log('🤖  Clean Architecture + TypeScript');
  console.log('🤖 ======================================');
  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`📊 API docs: http://localhost:${port}/api/v1`);
  console.log('🤖 ======================================');
  console.log('');
}

bootstrap();
