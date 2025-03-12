import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScriptTasksService } from './script-tasks.service';
import { ScriptTasksController } from './script-tasks.controller';
import { ScriptFile } from '@entities';
import { ScriptTask } from '@entities';
import { ScriptTaskLog } from '@entities';
import { ScriptTasksResolver } from './script-tasks.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScriptFile,
      ScriptTask,
      ScriptTaskLog,
    ]),
  ],
  controllers: [ScriptTasksController],
  providers: [ScriptTasksService, ScriptTasksResolver],
  exports: [ScriptTasksService],
})
export class ScriptTasksModule {}
