import { Controller, Get, Param, Query } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SubscriptionDto } from './dto/subscription.dto';
import { PaginatedSubscriptionsDto } from './dto/paginated-result.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10): PaginatedSubscriptionsDto {
    return this.subscriptionsService.findAll(+page, +limit);
  }

  @Get('topic/:topicId')
  findByTopicId(@Param('topicId') topicId: string): SubscriptionDto[] {
    return this.subscriptionsService.findByTopicId(topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): SubscriptionDto | undefined {
    return this.subscriptionsService.findOne(id);
  }
}
