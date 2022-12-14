import { Controller, Post, Logger, Body } from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './polls.dtos';

@Controller('polls')
export class PollsController {
  @Post()
  async createPoll(@Body() createPollDto: CreatePollDto) {
    Logger.log('createPoll');
    return createPollDto;
  }

  @Post('/join')
  async joinPoll(@Body() joinPollDto: JoinPollDto) {
    Logger.log('joinPoll');
    return joinPollDto;
  }

  @Post('/rejoin')
  async rejoinPoll() {
    Logger.log('rejoinPoll');
  }
}
