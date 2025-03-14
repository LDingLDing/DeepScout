import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ScriptTask } from './script-task.entity';

export enum ScriptTaskLogStatus {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

@Entity('script_task_log')
export class ScriptTaskLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ScriptTaskLogStatus,
    default: ScriptTaskLogStatus.INFO
  })
  status: ScriptTaskLogStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ScriptTask)
  @JoinColumn({ name: 'task_id' })
  task: ScriptTask;
}
