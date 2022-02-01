import { Module } from '@nestjs/common';
import { SendMailWithTweetJob } from './send-mail-with-tweets.job';

@Module({
  providers: [SendMailWithTweetJob],
})
export class MailingModule {}
