import { Module, Logger } from '@nestjs/common';
import { MembershipCardsService } from './membership-cards.service';
import { MembershipCardsRepository } from './membership-cards.repository';

@Module({
  providers: [
    {
      provide: Logger,
      useFactory: () => new Logger(MembershipCardsService.name),
    },
    MembershipCardsRepository,
    MembershipCardsService,
  ],
  exports: [MembershipCardsService, MembershipCardsRepository],
})
export class MembershipCardsModule {}
