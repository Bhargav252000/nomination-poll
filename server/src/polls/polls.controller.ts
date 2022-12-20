import { Controller, Post, Logger, Body } from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './polls.dtos';
import { PollsService } from './polls.service';

@Controller('polls')
export class PollsController {
  constructor(private pollsService: PollsService) {}

  @Post()
  async createPoll(@Body() createPollDto: CreatePollDto) {
    const result = await this.pollsService.createPoll(createPollDto);

    return result;
  }

  @Post('/join')
  async joinPoll(@Body() joinPollDto: JoinPollDto) {
    const result = await this.pollsService.joinPoll(joinPollDto);

    return result;
  }

  @Post('/rejoin')
  async rejoinPoll() {
    const result = await this.pollsService.rejoinPoll({
      name: 'From token',
      pollID: 'From token',
      userID: 'From token',
    });

    return result;
  }
}
