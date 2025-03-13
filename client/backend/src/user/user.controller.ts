import { Controller, Get, Put, Body, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    // 从 JWT 中获取用户 ID
    const userId = req.user['id'];
    
    // 从数据库获取用户信息
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      email: user.email,
      enable_email_push: user.enable_email_push,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const userId = req.user['id'];
    return this.userService.update(userId, updateUserDto);
  }
}
