import { Query, Resolver } from '@nestjs/graphql';
import { ScriptFile } from '@entities';

@Resolver(() => ScriptFile)
export class ScriptTasksResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello World';
  }
}
