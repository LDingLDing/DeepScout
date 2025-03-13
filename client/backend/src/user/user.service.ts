import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // 根据ID获取用户信息
  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }
  
  // 根据邮箱获取用户信息
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }
  
  // 根据邮箱查找或创建用户
  async findOrCreate(email: string): Promise<User> {
    // 先查找是否存在该邮箱的用户
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      return existingUser;
    }
    
    // 不存在则创建新用户
    const newUser = this.userRepository.create({
      email,
      enable_email_push: true
    });
    
    // 保存到数据库，TypeORM 会自动生成 UUID
    return await this.userRepository.save(newUser);
  }

  // 更新用户信息
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 更新用户信息
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async createUser(email: string): Promise<User> {
    // 不存在则创建新用户
    const newUser = this.userRepository.create({
      email,
      enable_email_push: true
    });
    
    // 保存到数据库，TypeORM 会自动生成 UUID
    return await this.userRepository.save(newUser);
  }
}
