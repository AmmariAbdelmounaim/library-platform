import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDatabase } from './index';

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: (configService: ConfigService) => {
        return createDatabase(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DB'],
})
export class DatabaseModule {}
