/**
 * TopicKnowledge Entity - 话题知识实体
 * 
 * 用途：
 * - 存储话题相关的知识内容
 * - 记录知识创建的任务来源
 * - 用于知识内容的展示和管理
 * 
 * 关联关系：
 * - 多对一：TopicKnowledge -> Topic (多个知识条目属于同一个话题)
 * - 多对一：TopicKnowledge -> ScriptTask (知识条目由特定任务创建)
 * 
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Topic } from './topic.entity';
import { ScriptTask } from '@entities';

@Entity('topic_knowledge')
export class TopicKnowledge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'topic_id' })
  topic_id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'created_by_taskid' })
  created_by_taskid: number;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @ManyToOne(() => ScriptTask)
  @JoinColumn({ name: 'created_by_taskid' })
  created_by_task: ScriptTask;
}
