/**
 * Subscription Entity - 订阅内容实体
 * 
 * 用途：
 * - 存储用户订阅的专题内容
 * - 记录内容的阅读状态和时间
 * - 用于内容展示和推送
 * 
 * 关联关系：
 * - 多对一：Subscription -> Topic (多个内容属于同一个话题)
 * - 多对一：Subscription -> User (多个内容可以被同一个用户阅读)
 */

// 用于存储用户订阅的专题内容
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Topic } from '../topic/topic.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column()
  topic_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp' })
  publish_time: Date;

  @Column({ type: 'timestamp' })
  read_time: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 