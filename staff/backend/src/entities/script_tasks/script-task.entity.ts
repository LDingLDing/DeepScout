/**
 * ScriptTask Entity - 脚本任务实体
 * 
 * 用途：
 * - 记录系统执行的脚本任务
 * - 追踪任务执行状态和结果
 * - 关联任务产生的内容
 * 
 * 关联关系：
 * - 一对多：ScriptTask -> TopicKnowledge (一个任务可以生成多个知识条目)
 * 
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ScriptFile } from './script-file.entity';

export enum ScriptTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

@Entity('script_task')
export class ScriptTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'script_id' })
  script_id: string;

  @Column({
    type: 'enum',
    enum: ScriptTaskStatus,
    default: ScriptTaskStatus.PENDING
  })
  status: ScriptTaskStatus;

  @Column({ type: 'timestamp', name: 'expected_run_time', nullable: true })
  expected_run_time: Date;

  @Column({ type: 'timestamp', name: 'started_at', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', name: 'finished_at', nullable: true })
  finished_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => ScriptFile)
  @JoinColumn({ name: 'script_id' })
  script: ScriptFile;
}
