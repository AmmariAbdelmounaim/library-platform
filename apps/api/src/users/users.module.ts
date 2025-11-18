import { Module, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: Logger,
      useFactory: () => new Logger(UsersService.name),
    },
    UsersRepository,
    UsersService,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
