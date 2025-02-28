import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // 数据库连接
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'deepscout',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: process.env.NODE_ENV !== 'production', // 生产环境禁用自动同步
    }),
    
    // GraphQL设置
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
    }),
    
    // 功能模块
    TasksModule,
    UsersModule,
    CrawlerModule,
    HealthModule,
  ],
})
export class AppModule {}
