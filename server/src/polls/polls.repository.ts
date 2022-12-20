import { Injectable, Inject, Logger } from '@nestjs/common';
import { IORedisKey } from 'src/redis.module';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AddParticipantData, CreatePollData } from './polls.types';
import { Poll } from 'shared';
import { InternalServerErrorException } from '@nestjs/common/exceptions';

@Injectable()
export class PollsRepository {
  // time-to-leave from config
  private readonly ttl: string;
  private readonly logger = new Logger(PollsRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('POLL_DURATION');
  }

  async createPoll({
    votesPerVoter,
    topic,
    pollID,
    userID,
  }: CreatePollData): Promise<Poll> {
    const initialPoll = {
      id: pollID,
      topic,
      votesPerVoter,
      participants: {},
      adminID: userID,
    };

    this.logger.log(
      `Creating poll new Poll: ${JSON.stringify(
        initialPoll,
        null,
        2,
      )} with TTL: ${this.ttl}`,
    );

    const key = `polls:${pollID}`;

    try {
      await this.redisClient
        .multi([
          ['send_command', 'JSON.SET', key, '.', JSON.stringify(initialPoll)],
          ['expire', key, this.ttl],
        ])
        .exec();

      return initialPoll;
    } catch (err) {
      this.logger.error(
        `Failed to create poll ${JSON.stringify(initialPoll)} ${err}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async getPoll(pollID: string): Promise<Poll> {
    this.logger.log(`Getting poll with ID: ${pollID}`);

    const key = `polls:${pollID}`;

    try {
      const currentPoll = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );

      this.logger.verbose(currentPoll);

      return JSON.parse(currentPoll);
    } catch (err) {
      this.logger.error(`Failed to get poll with ID: ${pollID} ${err}`);
      throw err;
    }
  }

  async addParticipant({
    pollID,
    userID,
    name,
  }: AddParticipantData): Promise<Poll> {
    this.logger.log(
      `Adding participant name/userID: ${name}/${userID} to poll with ID: ${pollID}`,
    );

    const key = `polls:${pollID}`;

    const participantsPath = `.participants.${userID}`;

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        participantsPath,
        JSON.stringify(name),
      );

      const pollJson = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );

      const poll = JSON.parse(pollJson) as Poll;

      this.logger.debug(
        `Current Participants for ${pollID} are ${JSON.stringify(
          poll.participants,
          null,
          2,
        )}`,
      );

      return poll;
    } catch (err) {
      this.logger.error(
        `Failed to add participant name/userID: ${name}/${userID} to poll with ID: ${pollID} ${err}`,
      );
      throw err;
    }
  }
}
