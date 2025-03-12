import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { StaffRole } from '../../../entities/staff_user/staff-user.entity';

export class CreateStaffDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(StaffRole)
  @IsNotEmpty()
  role: StaffRole;
}
