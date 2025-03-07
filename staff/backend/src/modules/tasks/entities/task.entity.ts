import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Source } from '../../sources/entities/source.entity';

export enum SourceType {
  WEB = 'web',
  RSS = 'rss',
  WECHAT = 'wechat'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn({ name: 'task_id' })
  id: number;

  @Column({ name: 'source_id' })
  sourceId: number;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: SourceType
  })
  sourceType: SourceType;

  @Column({ type: 'text' })
  code: string;

  @Column()
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Source)
  @JoinColumn({ name: 'source_id' })
  source: Source;
}
