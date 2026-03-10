import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ?? true, // true = allow all in dev; set CORS_ORIGIN in prod (e.g. https://yourfrontend.com)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Loyalty API')
    .setDescription('NestJS API with Supabase email OTP auth and profile/loyalty')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'OTP request & verify')
    .addTag('profile', 'User profile and loyalty (requires Bearer token)')
    .addTag('promotion', 'Promotions CRUD (title, description)')
    .addTag('users', 'List users (profiles)')
    .addTag('loyalty-level', 'CRUD loyalty levels (tiers by points)')
    .addTag('points', 'Add points / exchange (redeem) points')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API is running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();

