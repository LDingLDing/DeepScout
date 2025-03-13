import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('script_file')
export class ScriptFile {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'file_name' })
  file_name: string;

  @Field()
  @Column({ type: 'text' })
  content: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
