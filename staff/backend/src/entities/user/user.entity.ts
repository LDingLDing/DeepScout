/**
 * User Entity - 用户实体
 * 
 * 用途：
 * - 存储用户基本信息
 * - 管理用户认证和授权
 * - 用于用户相关功能的实现
 * 
 * 关联关系：
 * 
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  enable_email_push: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 