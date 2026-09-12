import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // The browser talks to this service cross-origin once the frontend is hosted separately
  // (Vercel). CORS_ORIGIN is a comma-separated allowlist set per environment; unset means
  // "reflect any origin", which is the local/dev default.
  const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
  app.enableCors({
    origin: corsOrigin && corsOrigin.length > 0 ? corsOrigin : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
