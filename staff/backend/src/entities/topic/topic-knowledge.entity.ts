import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Topic } from './topic.entity';
import { ScriptTask } from '@entities';

@Entity('topic_knowledge')
export class TopicKnowledge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'topic_id' })
  topicId: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by_taskid' })
  createdByTaskId: number;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @ManyToOne(() => ScriptTask)
  @JoinColumn({ name: 'created_by_taskid' })
  createdByTask: ScriptTask;
}
