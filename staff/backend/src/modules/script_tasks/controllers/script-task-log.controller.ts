import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ScriptTaskLogService } from '../services/script-task-log.service';
import { CreateScriptTaskLogDto } from '../dto/create-script-task-log.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { StaffRole } from '../../staff/entities/staff-user.entity';

@Controller('script-task-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScriptTaskLogController {
  constructor(private readonly scriptTaskLogService: ScriptTaskLogService) {}

  @Post()
  @Roles(StaffRole.ADMIN)
  create(@Body() createScriptTaskLogDto: CreateScriptTaskLogDto) {
    return this.scriptTaskLogService.create(createScriptTaskLogDto);
  }

  @Get('task/:taskId')
  @Roles(StaffRole.ADMIN)
  findByTaskId(@Param('taskId') taskId: string) {
    return this.scriptTaskLogService.findByTaskId(+taskId);
  }
}
