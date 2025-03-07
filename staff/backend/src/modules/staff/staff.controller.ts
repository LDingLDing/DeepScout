import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffRole } from './entities/staff-user.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { LoginStaffDto } from './dto/login-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('login')
  async login(@Body() loginDto: LoginStaffDto) {
    return this.staffService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.ADMIN)
  @Post()
  async create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.ADMIN)
  @Get()
  async findAll() {
    return this.staffService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.staffService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto
  ) {
    const result = await this.staffService.update(Number(id), updateStaffDto);
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(StaffRole.ADMIN)
  @Post(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: { password: string }
  ) {
    if (!resetPasswordDto || !resetPasswordDto.password) {
      throw new Error('Password is required');
    }
    
    const staff = await this.staffService.resetPassword(Number(id), resetPasswordDto.password);
    return { message: 'Password reset successfully', staff: { id: staff.id, email: staff.email } };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    // 获取当前登录用户信息
    return this.staffService.findOne(req.staff.id);
  }
}
