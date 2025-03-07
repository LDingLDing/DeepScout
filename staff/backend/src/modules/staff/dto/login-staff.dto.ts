import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginStaffDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
