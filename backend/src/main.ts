import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Prisma's BigInt fields (all our *_id columns) aren't JSON-serializable
// by default — JSON.stringify throws on them. Services in this project
// map BigInt -> string explicitly before returning, but this is a
// safety net for anything that slips through.
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`HS-Square API listening on http://localhost:${port}`);
}
bootstrap();
