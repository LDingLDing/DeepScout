import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ScriptFileService } from '../services/script-file.service';
import { CreateScriptFileDto } from '../dto/create-script-file.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { StaffRole } from '../../staff/entities/staff-user.entity';

@Controller('script-files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScriptFileController {
  constructor(private readonly scriptFileService: ScriptFileService) {}

  @Post()
  @Roles(StaffRole.ADMIN)
  create(@Body() createScriptFileDto: CreateScriptFileDto) {
    return this.scriptFileService.create(createScriptFileDto);
  }

  @Get()
  @Roles(StaffRole.ADMIN)
  findAll() {
    return this.scriptFileService.findAll();
  }

  @Get(':id')
  @Roles(StaffRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.scriptFileService.findOne(+id);
  }
}
