import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { LoansRepository } from './loans.repository';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [BooksModule],
  controllers: [LoansController],
  providers: [LoansRepository, LoansService],
  exports: [LoansService, LoansRepository],
})
export class LoansModule {}

