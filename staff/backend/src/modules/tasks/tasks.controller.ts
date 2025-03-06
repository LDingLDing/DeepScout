import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { StaffRole } from '../staff/entities/staff.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.create(createTaskDto, req.staff.id);
  }

  @Get()
  findAll(@Query() query: {
    page?: number;
    pageSize?: number;
    sourceId?: number;
    status?: string;
    keyword?: string;
  }) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Put(':id')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req) {
    return this.tasksService.update(+id, updateTaskDto, req.staff.id);
  }

  @Delete(':id')
  @Roles(StaffRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }

  @Get(':id/versions')
  getTaskVersions(@Param('id') id: string) {
    return this.tasksService.getTaskVersions(+id);
  }

  @Get(':id/versions/:versionId')
  getTaskVersionDetail(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.tasksService.getTaskVersionDetail(+id, +versionId);
  }

  @Put(':id/versions/:versionId/switch')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  switchVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Req() req,
  ) {
    return this.tasksService.switchVersion(+id, +versionId, req.staff.id);
  }

  @Post(':id/execute')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  executeTask(@Param('id') id: string) {
    return this.tasksService.executeTask(+id);
  }
}
