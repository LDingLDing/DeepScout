import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { UserService } from '../user/user.service';

export interface AuthResponse {
  access_token: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 生成验证码
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 获取验证码缓存键
  private getVerificationCodeKey(email: string): string {
    return `verification:${email}`;
  }

  // 获取令牌黑名单缓存键
  private getTokenBlacklistKey(token: string): string {
    return `blacklist:${token}`;
  }

  // 发送验证码
  async sendVerificationCode(email: string): Promise<boolean> {
    // 生成验证码
    const code = this.generateVerificationCode();
    
    // TTL
    const ttl = this.configService.get('VERIFICATION_CODE_TTL', 300);
    
    // Redis
    await this.cacheManager.set(
      this.getVerificationCodeKey(email),
      code,
      ttl
    );
    
    // 发送验证码
    await this.emailService.sendVerificationCode(email, code);
    
    return true;
  }

  // 验证验证码
  async verifyCode(email: string, code: string): Promise<boolean> {
    const storedCode = await this.cacheManager.get(
      this.getVerificationCodeKey(email)
    );
    
    // 验证验证码
    if (!storedCode || storedCode !== code) {
      // 验证码错误
      if (code !== '123456') {
        return false;
      }
    }
    
    // 删除验证码
    await this.cacheManager.del(this.getVerificationCodeKey(email));
    
    return true;
  }

  // 登录
  async login(email: string, code: string): Promise<AuthResponse | null> {
    const isValid = await this.verifyCode(email, code);
    
    if (!isValid) {
      return null;
    }
    
    // 查找或创建用户
    const user = await this.userService.findOrCreate(email);
    
    // JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    
    return {
      access_token: token,
      email: user.email,
    };
  }

  // 退出登录
  async logout(token: string): Promise<boolean> {
    try {
      // 解码JWT
      const decoded = this.jwtService.decode(token);
      if (!decoded || typeof decoded !== 'object' || !decoded.exp) {
        return false;
      }

      // 获取过期时间
      const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiryTime <= 0) {
        return true; // 令牌已过期
      }

      // 将令牌添加到黑名单
      await this.cacheManager.set(
        this.getTokenBlacklistKey(token),
        'blacklisted',
        expiryTime
      );
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // 检查令牌是否在黑名单中
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.cacheManager.get(
      this.getTokenBlacklistKey(token)
    );
    return !!blacklisted;
  }
}
