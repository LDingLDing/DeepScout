import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
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
