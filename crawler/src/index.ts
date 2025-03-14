import { DataSource } from 'typeorm';
import { TaskScheduler } from './services/TaskScheduler';
import { Logger } from './utils/logger';
import { ScriptFile } from '@entities/script_tasks/script-file.entity';
import { ScriptTask } from '@entities/script_tasks/script-task.entity';
import { ScriptTaskLog } from '@entities/script_tasks/script-task-log.entity';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const logger = new Logger();

async function main() {
  try {
    // 创建数据源
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [ScriptFile, ScriptTask, ScriptTaskLog],
      synchronize: true,
    });

    // 初始化数据源
    await dataSource.initialize();
    logger.info('Database connection established');

    // 启动任务调度器
    const scheduler = new TaskScheduler(dataSource);
    await scheduler.start();
    logger.info('Crawler service started successfully');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Failed to start crawler service:', error.message);
    }
    process.exit(1);
  }
}

main(); 