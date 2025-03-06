import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '../services/jwt.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    try {
      const token = this.jwtService.extractTokenFromHeader(authHeader);
      const payload = this.jwtService.verify(token);
      
      // 将用户信息附加到请求对象
      request.staff = {
        id: payload.sub,
        username: payload.username,
        role: payload.role
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('认证失败');
    }
  }
}
