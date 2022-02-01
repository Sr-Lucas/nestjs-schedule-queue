import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Tweet } from '../entities/tweet.entity';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

const TWEET_OFFSET = 'tweet-offset';

@Injectable()
export class TweetsCountService {
  private limit = 10;

  constructor(
    @InjectModel(Tweet)
    private tweetModel: typeof Tweet,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectQueue('emails')
    private emailsQueue: Queue,
  ) {}

  @Interval(5000)
  async countTweets(): Promise<void> {
    console.log('procurando tweets');

    let offset = await this.cacheManager.get<number>(TWEET_OFFSET);
    offset = offset === undefined ? 0 : offset;

    console.log('offset: ' + offset);

    const tweets = await this.tweetModel.findAll({
      offset,
      limit: this.limit,
    });

    console.log('Tweets: ' + tweets.length + ' encontrados');

    if (tweets.length === this.limit) {
      this.cacheManager.set<number>(TWEET_OFFSET, offset + this.limit, {
        ttl: 1 * 60 * 10,
      });

      console.log(`encontrou + ${this.limit} tweets`);
      this.emailsQueue.add({ tweets: tweets.map((tweet) => tweet.toJSON()) });
    }
  }
}
