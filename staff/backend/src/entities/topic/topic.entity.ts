/**
 * Topic Entity - 话题实体
 * 
 * 用途：
 * - 存储系统中的话题信息
 * - 作为订阅内容的分类依据
 * - 用于内容推送和用户订阅管理
 * 
 * 关联关系：
 * - 一对多：Topic -> Subscription (一个话题可以被多个用户订阅)
 * - 一对多：Topic -> TopicKnowledge (一个话题可以有多个知识条目)
 * 
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: false })
  hot: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 