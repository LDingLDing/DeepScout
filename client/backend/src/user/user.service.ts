import { Injectable } from '@nestjs/common';
import { User } from '@entities';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  // 模拟用户数据存储
  private readonly users: Map<string, User> = new Map();

  constructor() {
    // 初始化一些模拟数据
    this.users.set('1', {
      id: '1',
      email: 'test@example.com',
      enable_email_push: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // 根据ID获取用户信息
  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  // 根据邮箱获取用户信息
  async findByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }
  
  // 根据邮箱查找或创建用户
  async findOrCreate(email: string): Promise<User> {
    // 先查找是否存在该邮箱的用户
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      return existingUser;
    }
    
    // 不存在则创建新用户
    const id = (this.users.size + 1).toString();
    const newUser: User = {
      id,
      email,
      enable_email_push: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    this.users.set(id, newUser);
    return newUser;
  }

  // 更新用户信息
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    const updatedUser = {
      ...user,
      ...updateUserDto,
      updated_at: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }
}
