import { Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicDto } from './dto/topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  async findAll(): Promise<TopicDto[]> {
    return this.topicsService.findAll();
  }

  @Get('subscribed')
  @UseGuards(JwtAuthGuard)
  async findSubscribed(@Req() req: Request): Promise<TopicDto[]> {
    const userId = req.user['id'];
    return this.topicsService.findSubscribed(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TopicDto | undefined> {
    return this.topicsService.findOne(id);
  }

  @Post(':id/toggle-subscription')
  @UseGuards(JwtAuthGuard)
  async toggleSubscription(
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<TopicDto | undefined> {
    const userId = req.user['id'];
    return this.topicsService.toggleSubscription(id, userId);
  }
}
