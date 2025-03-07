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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('脚本任务')
@ApiBearerAuth()
@Controller('script-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScriptTasksController {
  constructor(private readonly scriptTasksService: ScriptTasksService) {}

  // 脚本文件相关接口
  @Post('files')
  @ApiOperation({ summary: '创建脚本文件' })
  @ApiResponse({ status: 201, description: '脚本文件创建成功' })
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  createScriptFile(@Body() createScriptFileDto: CreateScriptFileDto, @Req() req) {
    return this.scriptTasksService.createScriptFile(createScriptFileDto, req.staff.id);
  }

  @Get('files')
  @ApiOperation({ summary: '获取所有脚本文件' })
  @ApiResponse({ status: 200, description: '返回所有脚本文件列表' })
  findAllScriptFiles(@Query() query: {
    page?: number;
    pageSize?: number;
    fileName?: string;
  }) {
    return this.scriptTasksService.findAllScriptFiles(query);
  }

  @Get('files/:id')
  @ApiOperation({ summary: '获取指定脚本文件' })
  @ApiResponse({ status: 200, description: '返回指定的脚本文件' })
  @ApiResponse({ status: 404, description: '脚本文件未找到' })
  findScriptFileById(@Param('id') id: string) {
    return this.scriptTasksService.findScriptFileById(+id);
  }

  // 脚本任务相关接口
  @Post()
  @ApiOperation({ summary: '创建脚本任务' })
  @ApiResponse({ status: 201, description: '脚本任务创建成功' })
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  createScriptTask(@Body() createScriptTaskDto: CreateScriptTaskDto, @Req() req) {
    return this.scriptTasksService.createScriptTask(createScriptTaskDto, req.staff.id);
  }

  @Get()
  @ApiOperation({ summary: '获取所有脚本任务' })
  @ApiResponse({ status: 200, description: '返回所有脚本任务列表' })
  findAllScriptTasks(@Query() query: {
    page?: number;
    pageSize?: number;
    status?: ScriptTaskStatus;
    scriptId?: number;
  }) {
    return this.scriptTasksService.findAllScriptTasks(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定脚本任务' })
  @ApiResponse({ status: 200, description: '返回指定的脚本任务' })
  @ApiResponse({ status: 404, description: '脚本任务未找到' })
  findScriptTaskById(@Param('id') id: string) {
    return this.scriptTasksService.findScriptTaskById(+id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新脚本任务状态' })
  @ApiResponse({ status: 200, description: '脚本任务状态更新成功' })
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
  @ApiOperation({ summary: '获取脚本任务日志' })
  @ApiResponse({ status: 200, description: '返回脚本任务日志列表' })
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
  @ApiOperation({ summary: '执行脚本任务' })
  @ApiResponse({ status: 200, description: '脚本任务执行成功' })
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  executeScriptTask(@Param('id') id: string, @Req() req) {
    return this.scriptTasksService.executeScriptTask(+id, req.staff.id);
  }
}
