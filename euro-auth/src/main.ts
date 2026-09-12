import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Client } from 'pg';
import { AppModule } from './app.module';

// TypeORM creates its own migrations-tracking table inside the configured schema before
// running any migration -- including the one that would create that schema -- so the schema
// has to exist beforehand. docker-compose's postgres-init script covers this locally; nothing
// does on a bare Postgres instance (e.g. Railway), hence creating it directly here first.
async function ensureSchemaExists(): Promise<void> {
  const schema = process.env.DB_SCHEMA ?? 'auth';
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await client.connect();
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  await client.end();
}

async function bootstrap() {
  await ensureSchemaExists();
  const app = await NestFactory.create(AppModule);
  // Enforces the class-validator decorators on every DTO (CreateUserDto, LoginDto, ...) before a controller runs
  app.useGlobalPipes(
    new ValidationPipe({whitelist:true, forbidNonWhitelisted: true, transform: true})
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
