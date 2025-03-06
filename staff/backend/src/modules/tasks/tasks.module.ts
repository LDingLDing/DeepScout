import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { TaskVersion } from './entities/task-version.entity';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskVersion]),
    SourcesModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
