import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String, { description: '健康检查查询' })
  healthCheck(): string {
    return 'OK';
  }
}
