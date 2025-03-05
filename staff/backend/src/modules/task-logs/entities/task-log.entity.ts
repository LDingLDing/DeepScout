import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum TaskStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  RUNNING = 'running',
}

@Entity()
export class TaskLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @Column()
  taskName: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.RUNNING,
  })
  status: TaskStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
