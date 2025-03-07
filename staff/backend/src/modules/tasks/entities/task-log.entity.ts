import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from './task.entity';

export enum TaskLogStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity('task_logs')
export class TaskLog {
  @Column({ primary: true, name: 'task_id' })
  taskId: number;

  @Column({
    type: 'enum',
    enum: TaskLogStatus,
    default: TaskLogStatus.ACTIVE
  })
  status: TaskLogStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
