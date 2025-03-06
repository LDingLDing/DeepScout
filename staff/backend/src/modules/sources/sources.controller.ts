import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, Req } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { StaffRole } from '../staff/entities/staff.entity';

@Controller('sources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  create(@Body() createSourceDto: CreateSourceDto, @Req() req) {
    return this.sourcesService.create(createSourceDto, req.staff.id);
  }

  @Get()
  findAll(@Query() query: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    keyword?: string;
  }) {
    return this.sourcesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourcesService.findOne(+id);
  }

  @Put(':id')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  update(@Param('id') id: string, @Body() updateSourceDto: UpdateSourceDto, @Req() req) {
    return this.sourcesService.update(+id, updateSourceDto, req.staff.id);
  }

  @Delete(':id')
  @Roles(StaffRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.sourcesService.remove(+id);
  }
}
