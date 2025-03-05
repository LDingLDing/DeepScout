import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  // 生成JWT令牌
  async generateToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }

  // 验证JWT令牌
  verify(token: string): any {
    return this.jwtService.verify(token);
  }

  // 从请求头中提取令牌
  extractTokenFromHeader(authHeader: string): string {
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      throw new Error('无效的令牌格式');
    }
    return token;
  }
}
