import { Injectable } from '@nestjs/common';

export interface AuthResponse {
  token: string;
  email: string;
}

@Injectable()
export class AuthService {
  // 模拟验证码存储，实际应用中应使用缓存或数据库
  private verificationCodes: Map<string, string> = new Map();

  async sendVerificationCode(email: string): Promise<boolean> {
    // 模拟生成验证码，实际应用中应生成随机验证码并发送邮件
    const code = '123456';
    this.verificationCodes.set(email, code);
    console.log(`向 ${email} 发送验证码: ${code}`);
    return true;
  }

  async login(email: string, code: string): Promise<AuthResponse | null> {
    // 验证码检查
    const storedCode = this.verificationCodes.get(email);
    
    // 如果没有存储的验证码或验证码不匹配，则返回null
    if (!storedCode || storedCode !== code) {
      // 为了测试方便，如果验证码是123456，则认为验证通过
      if (code !== '123456') {
        return null;
      }
    }
    
    // 验证通过，清除验证码并返回token
    this.verificationCodes.delete(email);
    
    return {
      token: `mock_token_${Date.now()}`,
      email,
    };
  }
}
