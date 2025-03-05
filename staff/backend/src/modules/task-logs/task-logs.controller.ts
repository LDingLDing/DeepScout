import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TaskLogsService } from './task-logs.service';
import { TaskStatus } from './entities/task-log.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { StaffRole } from '../staff/entities/staff.entity';
import { FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TaskLog } from './entities/task-log.entity';

@Controller('task-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskLogsController {
  constructor(private readonly taskLogsService: TaskLogsService) {}

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.VIEWER)
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '30',
    @Query('taskId') taskId?: string,
    @Query('status') status?: TaskStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);
    
    const where: FindOptionsWhere<TaskLog> = {};
    
    if (taskId) {
      where.taskId = parseInt(taskId);
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.createdAt = Between(
        new Date(startDate),
        new Date(endDate)
      );
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(
        new Date(startDate)
      );
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(
        new Date(endDate)
      );
    }
    
    const logs = await this.taskLogsService.findAll(skip, take, where);
    return logs;
  }

  @Get(':id')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.VIEWER)
  async findOne(@Param('id') id: string) {
    return this.taskLogsService.findOne(parseInt(id));
  }

  @Get('task/:taskId')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.VIEWER)
  async findByTaskId(
    @Param('taskId') taskId: string,
    @Query('limit') limit: string = '10'
  ) {
    return this.taskLogsService.findByTaskId(parseInt(taskId), parseInt(limit));
  }
}
