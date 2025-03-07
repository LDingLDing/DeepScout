import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScriptTasksService } from './script-tasks.service';
import { ScriptTasksController } from './script-tasks.controller';
import { ScriptFile } from './entities/script-file.entity';
import { ScriptTask } from './entities/script-task.entity';
import { ScriptTaskLog } from './entities/script-task-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScriptFile,
      ScriptTask,
      ScriptTaskLog,
    ]),
  ],
  controllers: [ScriptTasksController],
  providers: [ScriptTasksService],
  exports: [ScriptTasksService],
})
export class ScriptTasksModule {}
