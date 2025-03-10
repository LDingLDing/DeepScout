import { Controller, Get, Param, Post } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicDto } from './dto/topic.dto';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  findAll(): TopicDto[] {
    return this.topicsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): TopicDto | undefined {
    return this.topicsService.findOne(id);
  }

  @Post(':id/subscribe')
  toggleSubscription(@Param('id') id: string): TopicDto | undefined {
    return this.topicsService.toggleSubscription(id);
  }
}
