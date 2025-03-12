import { Controller, Get, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { ScriptTaskService } from '../services/script-task.service';
import { CreateScriptTaskDto } from '../dto/create-script-task.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { StaffRole } from '../../../entities/staff_user/staff-user.entity';
import { ScriptTaskStatus } from '../entities/script-task.entity';

@Controller('script-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScriptTaskController {
  constructor(private readonly scriptTaskService: ScriptTaskService) {}

  @Post()
  @Roles(StaffRole.ADMIN)
  create(@Body() createScriptTaskDto: CreateScriptTaskDto) {
    return this.scriptTaskService.create(createScriptTaskDto);
  }

  @Get()
  @Roles(StaffRole.ADMIN)
  findAll() {
    return this.scriptTaskService.findAll();
  }

  @Get(':id')
  @Roles(StaffRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.scriptTaskService.findOne(+id);
  }

  @Put(':id/status')
  @Roles(StaffRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ScriptTaskStatus
  ) {
    return this.scriptTaskService.updateStatus(+id, status);
  }
}
