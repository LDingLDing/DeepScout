import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('未提供认证令牌');
    }
    
    // 在实际应用中，这里应该验证JWT令牌
    // 现在我们使用模拟数据，只要提供了令牌就认为是有效的
    
    // 模拟解析的用户信息
    request.user = {
      sub: '1', // 用户ID
      email: 'test@example.com',
    };
    
    return true;
  }
  
  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
