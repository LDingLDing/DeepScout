import { SubscriptionDto } from './subscription.dto';

export class PaginatedSubscriptionsDto {
  items: SubscriptionDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
