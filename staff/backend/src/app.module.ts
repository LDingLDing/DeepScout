import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { StaffModule } from './modules/staff/staff.module';
import { ScriptTasksModule } from './modules/script_tasks/script-tasks.module';

@Module({
  imports: [
    // 配置模块，加载环境变量
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '../../.env')], // 指向项目根目录的.env文件
    }),
    
    // 数据库连接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const password = configService.get('DB_PASSWORD');
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: +configService.get<number>('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: String(password), // 确保密码是字符串类型
          database: configService.get('DB_DATABASE', 'inforadar'),
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          autoLoadEntities: true,
          synchronize: configService.get('NODE_ENV') !== 'production', // 生产环境禁用自动同步
        };
      },
    }),
    
    // GraphQL设置
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
    }),
    
    // 应用模块
    StaffModule,
    ScriptTasksModule,
  ],
})
export class AppModule {}
