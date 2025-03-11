import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    // Get user ID from JWT
    const userId = req.user.sub;
    // Mock data, should be retrieved from database in actual application
    return {
      email: 'test@example.com',
      enable_email_push: false
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    try {
      // Get user ID from JWT
      const userId = req.user.sub;
      
      // In actual application, this should call service layer to update database
      // Now we just return mock data
      return {
        email: 'test@example.com',
        enable_email_push: updateUserDto.enable_email_push !== undefined ? 
          updateUserDto.enable_email_push : false
      };
    } catch (error) {
      throw error;
    }
  }
}
