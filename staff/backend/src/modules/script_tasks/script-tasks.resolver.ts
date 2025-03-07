import { Query, Resolver } from '@nestjs/graphql';
import { ScriptFile } from './entities/script-file.entity';

@Resolver(() => ScriptFile)
export class ScriptTasksResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello World';
  }
}
