import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffUser } from '../../entities/staff_user/staff-user.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { LoginStaffDto } from './dto/login-staff.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffUser)
    private staffRepository: Repository<StaffUser>,
    private jwtService: JwtService,
  ) {}

  async findAll(): Promise<StaffUser[]> {
    return this.staffRepository.find();
  }

  async findOne(id: number): Promise<StaffUser> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async findByEmail(email: string): Promise<StaffUser> {
    return this.staffRepository.findOne({ where: { email } });
  }

  async create(createStaffDto: CreateStaffDto): Promise<StaffUser> {
    const { email, password, name, role } = createStaffDto;

    // 检查邮箱是否已存在
    const existingStaff = await this.findByEmail(email);
    if (existingStaff) {
      throw new ConflictException(`Email ${email} already exists`);
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = this.staffRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    return this.staffRepository.save(staff);
  }

  async update(id: number, updateStaffDto: UpdateStaffDto): Promise<StaffUser> {
    const staff = await this.findOne(id);

    // 如果更新密码，需要加密
    if (updateStaffDto.password) {
      updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, 10);
    }

    // 如果更新邮箱，检查是否已存在
    if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
      const existingStaff = await this.findByEmail(updateStaffDto.email);
      if (existingStaff) {
        throw new ConflictException(`Email ${updateStaffDto.email} already exists`);
      }
    }

    // 使用Object.assign更新实体
    Object.assign(staff, updateStaffDto);
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }

  async validateStaff(email: string, password: string): Promise<StaffUser> {
    const staff = await this.findByEmail(email);
    if (!staff) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return staff;
  }

  async login(loginDto: LoginStaffDto) {
    const { email, password } = loginDto;
    const staff = await this.validateStaff(email, password);

    const payload = { sub: staff.id, email: staff.email, role: staff.role };
    return {
      access_token: this.jwtService.sign(payload),
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
      },
    };
  }

  async resetPassword(id: number, password: string): Promise<StaffUser> {
    if (!password) {
      throw new Error('Password is required');
    }
    
    const staff = await this.findOne(id);
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 更新密码
    staff.password = hashedPassword;
    return this.staffRepository.save(staff);
  }
}
