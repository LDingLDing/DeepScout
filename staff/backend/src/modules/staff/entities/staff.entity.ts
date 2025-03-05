import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StaffRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: StaffRole,
    default: StaffRole.VIEWER,
  })
  role: StaffRole;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
