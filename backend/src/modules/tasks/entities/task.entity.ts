import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity('tasks')
export class Task {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ type: 'text' })
  extract_rules: string;

  @Field(() => [TaskTarget])
  @Column('jsonb')
  targets: TaskTarget[];

  @Field(() => TaskSchedule)
  @Column('jsonb')
  schedule: TaskSchedule;

  @Field()
  @Column({ default: 'pending' })
  status: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({ name: 'user_id' })
  userId: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@ObjectType()
export class TaskTarget {
  @Field()
  url: string;

  @Field({ nullable: true })
  selector?: string;
}

@ObjectType()
export class TaskSchedule {
  @Field()
  frequency: string;

  @Field()
  timezone: string;
}
