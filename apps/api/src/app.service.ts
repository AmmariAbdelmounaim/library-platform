import { Injectable, Logger } from '@nestjs/common';
import { WithErrorHandling } from './utils/with-error-handling.decorator';

@Injectable()
export class AppService {
  constructor(private readonly logger: Logger) {}

  @WithErrorHandling('AppService', 'getData')
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
