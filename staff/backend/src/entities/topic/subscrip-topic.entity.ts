/**
 * SubscripTopic Entity - 用户话题订阅关系实体
 * 
 * 用途：
 * - 维护用户与话题之间的订阅关系
 * - 记录用户订阅话题的状态
 * - 用于个性化话题推送
 * 
 * 关联关系：
 * - 多对一：SubscripTopic -> Topic (多个订阅可以关联到同一个话题)
 * - 多对一：SubscripTopic -> User (多个订阅可以属于同一个用户)
 * 
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Topic } from './topic.entity';

@Entity('subscrip_topic')
export class SubscripTopic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column()
  topic_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
