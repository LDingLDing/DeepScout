import { SubscriptionDto } from './subscription.dto';

export class PaginatedResultDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class PaginatedSubscriptionsDto extends PaginatedResultDto<SubscriptionDto> {
  items: SubscriptionDto[];
}
