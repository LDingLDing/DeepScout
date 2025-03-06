import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { Staff } from './entities/staff.entity';
import { JwtService } from '../../services/jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'staff-management-secret-key'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '24h') },
      }),
    }),
  ],
  controllers: [StaffController],
  providers: [StaffService, JwtService],
  exports: [StaffService, JwtService],
})
export class StaffModule {}
