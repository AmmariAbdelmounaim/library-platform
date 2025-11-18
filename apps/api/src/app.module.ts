import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';

// Calculate path to root .env file
// Try multiple possible locations
const possiblePaths = [
  resolve(__dirname, '..', '..', '..', '.env'), // From dist/ or src/
  resolve(process.cwd(), '.env'), // From project root
];

// Find the first existing .env file
const rootEnvPath =
  possiblePaths.find((path) => existsSync(path)) || possiblePaths[0];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: rootEnvPath,
      // Also load from process.env as fallback
      load: [],
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
