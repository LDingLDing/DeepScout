import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StaffRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator'
}

@Entity('staff_user')
export class StaffUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: StaffRole,
    default: StaffRole.OPERATOR
  })
  role: StaffRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
