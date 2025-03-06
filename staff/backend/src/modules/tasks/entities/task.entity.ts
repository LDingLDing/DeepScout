import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

export enum TaskStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  sourceId: number;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  currentVersionId: number;

  @Column({ nullable: true })
  schedule: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.INACTIVE,
  })
  status: TaskStatus;

  @Column({ nullable: true, type: 'timestamp' })
  lastRunAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  nextRunAt: Date;

  @Column()
  createdBy: number;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'createdBy' })
  creator: Staff;

  @Column({ nullable: true })
  updatedBy: number;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'updatedBy' })
  updater: Staff;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
