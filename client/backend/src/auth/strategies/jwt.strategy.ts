import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your_jwt_secret_key'),
      passReqToCallback: true, // 将请求对象传递给validate方法
    });
  }

  async validate(request: any, payload: any) {
    try {
      // 从请求头中获取令牌
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      
      // 检查令牌是否在黑名单中
      const isBlacklisted = await this.authService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('令牌已失效，请重新登录');
      }

      // 验证用户是否存在
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 返回用户信息，这些信息会被挂载到 req.user 上
      const userInfo = { id: user.id, email: user.email };
      return userInfo;
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('认证失败');
    }
  }
}
