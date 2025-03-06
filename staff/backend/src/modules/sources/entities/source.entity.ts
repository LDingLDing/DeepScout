import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

export enum SourceType {
  WEBSITE = 'website',
  RSS = 'rss',
  API = 'api',
  WECHAT = 'wechat',
  OTHER = 'other',
}

export enum SourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: SourceType,
  })
  type: SourceType;

  @Column({ length: 255, nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({
    type: 'enum',
    enum: SourceStatus,
    default: SourceStatus.ACTIVE,
  })
  status: SourceStatus;

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
