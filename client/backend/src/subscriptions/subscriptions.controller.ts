import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SubscriptionDto } from './dto/subscription.dto';
import { PaginatedSubscriptionsDto } from './dto/paginated-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'topics', required: false, isArray: true })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('topics') topics: string[] = [],
    @Req() req: Request
  ): Promise<PaginatedSubscriptionsDto> {
    const userId = req.user['id'];
    return this.subscriptionsService.findAll(page, limit, topics, userId);
  }

  @Get('topic/:topicId')
  @UseGuards(JwtAuthGuard)
  async findByTopicId(
    @Param('topicId') topic_id: string,
    @Req() req: Request
  ): Promise<SubscriptionDto[]> {
    const userId = req.user['id'];
    return this.subscriptionsService.findByTopicId(topic_id, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<SubscriptionDto | undefined> {
    const userId = req.user['id'];
    return this.subscriptionsService.findOne(id, userId);
  }
}
