import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Source } from './source.entity';

export enum UserSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity('user_source')
export class UserSource {
  @Column({ primary: true, name: 'user_id' })
  userId: number;

  @Column({ primary: true, name: 'source_id' })
  sourceId: number;

  @Column()
  frequency: string;

  @Column({
    type: 'enum',
    enum: UserSourceStatus,
    default: UserSourceStatus.ACTIVE
  })
  status: UserSourceStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Source)
  @JoinColumn({ name: 'source_id' })
  source: Source;
}
