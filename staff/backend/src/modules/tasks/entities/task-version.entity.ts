import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';
import { Task } from './task.entity';

@Entity()
export class TaskVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column()
  version: number;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column()
  createdBy: number;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'createdBy' })
  creator: Staff;

  @CreateDateColumn()
  createdAt: Date;
}
