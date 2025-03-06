import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff, StaffRole } from './entities/staff.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private jwtService: JwtService,
  ) {}

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find();
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async findByUsername(username: string): Promise<Staff> {
    return this.staffRepository.findOne({ where: { username } });
  }

  async create(createStaffDto: any): Promise<Staff> {
    const { username, password, email, role, isActive = true } = createStaffDto;

    // 检查用户名是否已存在
    const existingStaff = await this.findByUsername(username);
    if (existingStaff) {
      throw new ConflictException(`Username ${username} already exists`);
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = this.staffRepository.create({
      username,
      password: hashedPassword,
      email,
      role,
      isActive,
    });

    return this.staffRepository.save(staff);
  }

  async update(id: number, updateStaffDto: any): Promise<Staff> {
    const staff = await this.findOne(id);

    // 如果更新密码，需要加密
    if (updateStaffDto.password) {
      updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, 10);
    }
    
    // 处理isActive属性，确保其值为布尔类型
    if (updateStaffDto.isActive !== undefined) {
      updateStaffDto.isActive = updateStaffDto.isActive === true || updateStaffDto.isActive === 'true';
    }

    // 使用queryBuilder直接更新数据库
    try {
      // 使用queryBuilder直接更新数据库
      await this.staffRepository.update(id, updateStaffDto);
      // 查询更新后的员工信息
      const updatedStaff = await this.findOne(id);
      return updatedStaff;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }

  async validateStaff(username: string, password: string): Promise<Staff> {
    const staff = await this.findByUsername(username);
    if (!staff) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return staff;
  }

  async login(loginDto: any) {
    const { username, password } = loginDto;
    const staff = await this.validateStaff(username, password);

    const payload = { sub: staff.id, username: staff.username, role: staff.role };
    return {
      access_token: this.jwtService.sign(payload),
      staff: {
        id: staff.id,
        username: staff.username,
        email: staff.email,
        role: staff.role,
      },
    };
  }

  async resetPassword(id: number, password: string): Promise<Staff> {
    if (!id) {
      throw new Error('Staff ID is required');
    }
    
    if (!password) {
      throw new Error('Password is required');
    }
    
    const staff = await this.findOne(id);
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 更新密码，TypeORM会自动处理updatedAt
    staff.password = hashedPassword;
    const savedStaff = await this.staffRepository.save(staff);
    return savedStaff;
  }
}
