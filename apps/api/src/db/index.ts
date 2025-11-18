import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ConfigService } from '@nestjs/config';
import * as schema from './migrations/schema';

// Factory function to create database connection
export function createDatabase(configService: ConfigService) {
  // Get connection string from environment using ConfigService
  // Support both DATABASE_URL and individual POSTGRES_* variables
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const dbUser =
    configService.get<string>('POSTGRES_USER') ||
    configService.get<string>('DB_USER');
  const dbPassword =
    configService.get<string>('POSTGRES_PASSWORD') ||
    configService.get<string>('DB_PASSWORD');
  const dbHost =
    configService.get<string>('POSTGRES_HOST') ||
    configService.get<string>('DB_HOST');
  const dbPort =
    configService.get<string>('POSTGRES_PORT') ||
    configService.get<string>('DB_PORT');
  const dbName =
    configService.get<string>('POSTGRES_DB') ||
    configService.get<string>('DB_NAME');

  const connectionString =
    databaseUrl ||
    `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

  // Validate connection string
  if (
    !connectionString ||
    connectionString.includes('undefined') ||
    connectionString.includes('null')
  ) {
    throw new Error(
      'Invalid database connection string. Please set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, and POSTGRES_DB environment variables.',
    );
  }

  // Create postgres client
  const client = postgres(connectionString, {
    max: 10,
  });

  // Create drizzle instance with schema
  return drizzle(client, { schema });
}

// Export schema for use in queries
export * from './migrations/schema';
