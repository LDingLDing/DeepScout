import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, Req } from '@nestjs/common';
import { ScriptTasksService } from './script-tasks.service';
import { CreateScriptFileDto } from './dto/create-script-file.dto';
import { CreateScriptTaskDto } from './dto/create-script-task.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { StaffRole } from '../staff/entities/staff-user.entity';
import { ScriptTaskStatus } from './entities/script-task.entity';
import { ScriptTaskLogStatus } from './entities/script-task-log.entity';

@Controller('script-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScriptTasksController {
  constructor(private readonly scriptTasksService: ScriptTasksService) {}

  // 脚本文件相关接口
  @Post('files')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  createScriptFile(@Body() createScriptFileDto: CreateScriptFileDto, @Req() req) {
    return this.scriptTasksService.createScriptFile(createScriptFileDto, req.staff.id);
  }

  @Get('files')
  findAllScriptFiles(@Query() query: {
    page?: number;
    pageSize?: number;
    fileName?: string;
  }) {
    return this.scriptTasksService.findAllScriptFiles(query);
  }

  @Get('files/:id')
  findScriptFileById(@Param('id') id: string) {
    return this.scriptTasksService.findScriptFileById(+id);
  }

  // 脚本任务相关接口
  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  createScriptTask(@Body() createScriptTaskDto: CreateScriptTaskDto, @Req() req) {
    return this.scriptTasksService.createScriptTask(createScriptTaskDto, req.staff.id);
  }

  @Get()
  findAllScriptTasks(@Query() query: {
    page?: number;
    pageSize?: number;
    status?: ScriptTaskStatus;
    scriptId?: number;
  }) {
    return this.scriptTasksService.findAllScriptTasks(query);
  }

  @Get(':id')
  findScriptTaskById(@Param('id') id: string) {
    return this.scriptTasksService.findScriptTaskById(+id);
  }

  @Put(':id/status')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  updateScriptTaskStatus(
    @Param('id') id: string,
    @Body('status') status: ScriptTaskStatus,
    @Req() req,
  ) {
    return this.scriptTasksService.updateScriptTaskStatus(+id, status, req.staff.id);
  }

  // 任务日志相关接口
  @Get(':id/logs')
  findScriptTaskLogs(
    @Param('id') id: string,
    @Query() query: {
      page?: number;
      pageSize?: number;
      status?: ScriptTaskLogStatus;
    },
  ) {
    return this.scriptTasksService.findScriptTaskLogs(+id, query);
  }

  // 执行任务
  @Post(':id/execute')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  executeScriptTask(@Param('id') id: string, @Req() req) {
    return this.scriptTasksService.executeScriptTask(+id, req.staff.id);
  }
}
