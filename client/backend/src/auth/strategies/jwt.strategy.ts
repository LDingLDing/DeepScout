import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your_jwt_secret_key'),
      passReqToCallback: true, // 将请求对象传递给validate方法
    });
  }

  async validate(request: any, payload: any) {
    // 从请求头中获取令牌
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    
    // 检查令牌是否在黑名单中
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('令牌已失效，请重新登录');
    }
    
    return { id: payload.sub, email: payload.email };
  }
}
