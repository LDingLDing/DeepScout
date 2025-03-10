import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';

class SendVerificationCodeDto {
  email: string;
}

class LoginDto {
  email: string;
  code: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  async sendVerificationCode(@Body() dto: SendVerificationCodeDto): Promise<{ success: boolean }> {
    const result = await this.authService.sendVerificationCode(dto.email);
    return { success: result };
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    const result = await this.authService.login(dto.email, dto.code);
    if (!result) {
      throw new HttpException('验证码错误', HttpStatus.UNAUTHORIZED);
    }
    return result;
  }
}
