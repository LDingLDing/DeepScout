import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ScriptTask } from './script-task.entity';

@Entity('script_task_log')
export class ScriptTaskLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ScriptTask)
  @JoinColumn({ name: 'task_id' })
  task: ScriptTask;
}
