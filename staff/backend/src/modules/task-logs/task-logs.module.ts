import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskLogsController } from './task-logs.controller';
import { TaskLogsService } from './task-logs.service';
import { TaskLog } from './entities/task-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskLog])],
  controllers: [TaskLogsController],
  providers: [TaskLogsService],
  exports: [TaskLogsService],
})
export class TaskLogsModule {}
