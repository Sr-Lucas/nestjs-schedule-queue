import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('emails')
export class SendMailWithTweetJob {
  @Process()
  handle(job: Job) {
    console.log(JSON.stringify(job.data));
  }
}
