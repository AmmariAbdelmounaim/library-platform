import { config } from 'dotenv';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

// Load .env from root of project
// Try multiple possible locations
const possiblePaths = [
  resolve(__dirname, '..', '..', '..', '.env'), // From dist/ or src/
  resolve(process.cwd(), '.env'), // From project root
];

// Find the first existing .env file
const rootEnvPath =
  possiblePaths.find((path) => existsSync(path)) || possiblePaths[0];

if (existsSync(rootEnvPath)) {
  config({ path: rootEnvPath });
}

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
