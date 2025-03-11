import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class SendCodeDto {
  email: string;
}

class VerifyCodeDto {
  email: string;
  code: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body() sendCodeDto: SendCodeDto): Promise<{ success: boolean }> {
    try {
      const result = await this.authService.sendVerificationCode(sendCodeDto.email);
      return { success: result };
    } catch (error) {
      throw new HttpException('发送验证码失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() verifyCodeDto: VerifyCodeDto): Promise<AuthResponse> {
    const result = await this.authService.login(verifyCodeDto.email, verifyCodeDto.code);
    
    if (!result) {
      throw new HttpException('验证码无效或已过期', HttpStatus.UNAUTHORIZED);
    }
    
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req): Promise<{ success: boolean }> {
    try {
      // 从请求头中获取 Authorization 信息
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException('无效的令牌', HttpStatus.UNAUTHORIZED);
      }
      
      // 提取令牌
      const token = authHeader.substring(7);
      const result = await this.authService.logout(token);
      
      return { success: result };
    } catch (error) {
      throw new HttpException('退出登录失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return { email: req.user.email };
  }
}
